import { Injectable } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  // ==================== ALGORITMO DE MATCHING ====================
  private calculateScore(buyer: any, property: any): number {
    let score = 0;

    // Cidade (peso: 40 pontos)
    if (buyer.desiredCity.toLowerCase() === property.city.toLowerCase()) {
      score += 40;
    }

    // Tipo de imóvel (peso: 25 pontos)
    if (buyer.propertyType === property.type) {
      score += 25;
    }

    // Preço dentro do orçamento (peso: 25 pontos)
    const price = Number(property.price);
    const maxPrice = Number(buyer.maxPrice);
    const minPrice = Number(buyer.minPrice || 0);

    if (price <= maxPrice) {
      if (price >= maxPrice * 0.8) score += 25; // Preço ideal (80-100% do máximo)
      else if (price >= maxPrice * 0.5) score += 15; // Preço bom
      else score += 5; // Dentro do orçamento mas distante
    }

    // Quartos (peso: 10 pontos)
    if (buyer.bedrooms && property.bedrooms) {
      if (property.bedrooms >= buyer.bedrooms) score += 10;
      else if (property.bedrooms === buyer.bedrooms - 1) score += 5;
    }

    // Bairro desejado (bônus: 10 pontos)
    if (buyer.desiredNeighborhood && property.neighborhood) {
      if (buyer.desiredNeighborhood.toLowerCase() === property.neighborhood.toLowerCase()) {
        score += 10;
      }
    }

    return Math.min(score, 100);
  }

  async generateMatches(agentId: string) {
    // Buscar todos os compradores ativos do corretor
    const buyers = await this.prisma.buyer.findMany({
      where: { agentId, status: 'ACTIVE' },
    });

    // Buscar todos os imóveis disponíveis e públicos
    const properties = await this.prisma.property.findMany({
      where: { status: 'AVAILABLE', isPublic: true },
    });

    const matchesCreated = [];

    for (const buyer of buyers) {
      for (const property of properties) {
        const score = this.calculateScore(buyer, property);
        if (score >= 30) { // Threshold mínimo de relevância
          try {
            const match = await this.prisma.match.upsert({
              where: { buyerId_propertyId: { buyerId: buyer.id, propertyId: property.id } },
              update: { score },
              create: { buyerId: buyer.id, propertyId: property.id, score },
            });
            matchesCreated.push(match);
          } catch {}
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

    const [matches, total] = await Promise.all([
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
    ]);

    // Ocultar contatos do comprador em matches cruzados (comprador de outro corretor)
    const processed = matches.map((m) => {
      if (m.buyer?.agent?.id !== agentId) {
        return { ...m, buyer: { ...m.buyer, phone: null, email: null } };
      }
      return m;
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
