import { Injectable } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  // ==================== ALGORITMO DE MATCHING ====================
  private normalizeCity(city: string): string {
    return city
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // remove acentos
  }

  private calculateScore(buyer: any, property: any): number {
    let score = 0;

    // Cidade (peso: 40 pontos) — comparação sem acentos e case-insensitive
    const buyerCity = this.normalizeCity(buyer.desiredCity);
    const propCity  = this.normalizeCity(property.city);
    if (buyerCity === propCity || buyerCity.includes(propCity) || propCity.includes(buyerCity)) {
      score += 40;
    }

    // Tipo de imóvel (peso: 25 pontos)
    if (buyer.propertyType === property.type) {
      score += 25;
    }

    // Preço dentro do orçamento (peso: 25 pontos)
    const price    = Number(property.price);
    const maxPrice = Number(buyer.maxPrice);

    if (price <= maxPrice) {
      if (price >= maxPrice * 0.8) score += 25;      // Preço ideal (80-100% do máximo)
      else if (price >= maxPrice * 0.5) score += 15; // Preço bom
      else score += 8;                               // Dentro do orçamento mas distante
    }

    // Quartos (peso: 10 pontos)
    if (buyer.bedrooms && property.bedrooms) {
      if (property.bedrooms >= buyer.bedrooms) score += 10;
      else if (property.bedrooms === buyer.bedrooms - 1) score += 5;
    }

    // Bairro desejado (bônus: 10 pontos)
    if (buyer.desiredNeighborhood && property.neighborhood) {
      const buyerNeigh = this.normalizeCity(buyer.desiredNeighborhood);
      const propNeigh  = this.normalizeCity(property.neighborhood);
      if (buyerNeigh === propNeigh || buyerNeigh.includes(propNeigh) || propNeigh.includes(buyerNeigh)) {
        score += 10;
      }
    }

    return Math.min(score, 100);
  }

  private async upsertMatch(buyerId: string, propertyId: string, score: number) {
    return this.prisma.match.upsert({
      where:  { buyerId_propertyId: { buyerId, propertyId } },
      update: { score },
      create: { buyerId, propertyId, score },
    });
  }

  async generateMatches(agentId: string) {
    // Buscar dados do agente para matching bidirecional
    const [myBuyers, myProperties, allBuyers, allProperties] = await Promise.all([
      // Meus compradores ativos
      this.prisma.buyer.findMany({ where: { agentId, status: 'ACTIVE' } }),
      // Meus imóveis disponíveis
      this.prisma.property.findMany({ where: { agentId, status: 'AVAILABLE', isPublic: true } }),
      // Todos os compradores ativos da plataforma
      this.prisma.buyer.findMany({ where: { status: 'ACTIVE' } }),
      // Todos os imóveis disponíveis da plataforma
      this.prisma.property.findMany({ where: { status: 'AVAILABLE', isPublic: true } }),
    ]);

    const THRESHOLD = 20; // score mínimo para criar match
    const processed = new Set<string>(); // evitar duplicatas
    const matchesCreated: any[] = [];

    // ── Cenário 1: meus compradores × todos os imóveis da plataforma ──────────
    for (const buyer of myBuyers) {
      for (const property of allProperties) {
        const key = `${buyer.id}:${property.id}`;
        if (processed.has(key)) continue;
        processed.add(key);
        const score = this.calculateScore(buyer, property);
        if (score >= THRESHOLD) {
          try { matchesCreated.push(await this.upsertMatch(buyer.id, property.id, score)); } catch {}
        }
      }
    }

    // ── Cenário 2: todos os compradores da plataforma × meus imóveis ──────────
    for (const buyer of allBuyers) {
      for (const property of myProperties) {
        const key = `${buyer.id}:${property.id}`;
        if (processed.has(key)) continue;
        processed.add(key);
        const score = this.calculateScore(buyer, property);
        if (score >= THRESHOLD) {
          try { matchesCreated.push(await this.upsertMatch(buyer.id, property.id, score)); } catch {}
        }
      }
    }

    return { message: `${matchesCreated.length} matches processados`, count: matchesCreated.length };
  }

  async getMyMatches(agentId: string, query: any) {
    const { page = 1, limit = 20, minScore = 0, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MatchWhereInput = {
      score: { gte: Number(minScore) },
      OR: [
        { buyer: { agentId } },
        { property: { agentId } },
      ],
      ...(status && { status: status as MatchStatus }),
    };

    const [matches, total, myPartnerships] = await Promise.all([
      this.prisma.match.findMany({
        where: where as Prisma.MatchWhereInput, skip, take: Number(limit),
        include: {
          buyer: {
            select: {
              id: true, buyerName: true, desiredCity: true, maxPrice: true,
              propertyType: true, bedrooms: true, phone: true, email: true,
              agent: { select: { id: true, name: true, phone: true } },
            },
          },
          property: {
            select: {
              id: true, title: true, type: true, price: true, city: true,
              neighborhood: true, bedrooms: true, bathrooms: true, areaM2: true,
              photos: true, agentId: true,
              agent: { select: { id: true, name: true, phone: true } },
            },
          },
        },
        orderBy: { score: 'desc' },
      }),
      this.prisma.match.count({ where }),
      // Todas as parcerias do agente (pendentes ou aceitas) para cruzar com os matches
      this.prisma.partnership.findMany({
        where: {
          OR: [{ requesterId: agentId }, { receiverId: agentId }],
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
        select: { id: true, propertyId: true, requesterId: true, receiverId: true, status: true },
      }),
    ]);

    // Índice de parceria por propertyId — preferência para ACCEPTED sobre PENDING
    const partnershipMap = new Map<string, any>();
    for (const p of myPartnerships) {
      const existing = partnershipMap.get(p.propertyId);
      if (!existing || p.status === 'ACCEPTED') {
        partnershipMap.set(p.propertyId, p);
      }
    }

    const processed = matches.map((m) => {
      const isMine = m.buyer?.agent?.id === agentId;
      const partnership = partnershipMap.get(m.property?.id) ?? null;
      const partnershipAccepted = partnership?.status === 'ACCEPTED';

      // Revelar contatos do comprador se: é meu comprador, OU parceria foi aceita
      const buyer = isMine || partnershipAccepted
        ? m.buyer
        : { ...m.buyer, phone: null, email: null };

      return { ...m, buyer, partnership };
    });

    return { data: processed, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async getBestMatches(agentId: string) {
    return this.prisma.match.findMany({
      where: {
        score: { gte: 70 },
        status: MatchStatus.PENDING,
        OR: [
          { buyer: { agentId } },
          { property: { agentId } },
        ],
      },
      take: 10,
      include: {
        buyer: { select: { id: true, buyerName: true, desiredCity: true, maxPrice: true, propertyType: true } },
        property: { select: { id: true, title: true, type: true, price: true, city: true, photos: true } },
      },
      orderBy: { score: 'desc' },
    });
  }

  async updateMatchStatus(matchId: string, status: string, agentId: string) {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { buyer: { agentId } },
          { property: { agentId } },
        ],
      },
    });
    if (!match) throw new Error('Match não encontrado');
    return this.prisma.match.update({ where: { id: matchId }, data: { status: status as any } });
  }

  async getMatchesForBuyer(buyerId: string, agentId: string) {
    return this.prisma.match.findMany({
      where: { buyerId, buyer: { agentId } },
      include: {
        property: {
          include: { agent: { select: { id: true, name: true, phone: true, email: true } } },
        },
      },
      orderBy: { score: 'desc' },
    });
  }
}
