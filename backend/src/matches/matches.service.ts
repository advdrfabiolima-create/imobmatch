import { Injectable } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';

// Bônus adicionado ao score de match de acordo com o plano do corretor do imóvel.
// O valor é somado após o cálculo 0–100 e armazenado no banco para ordenação.
// No frontend o score é exibido com Math.min(score, 100) para não ultrapassar 100%.
const PLAN_BOOST: Record<string, number> = {
  free:    0,
  starter: 0,
  pro:     5,
  premium: 10,
  agency:  15,
};

// Planos que habilitam o match automático entre corretores diferentes.
// Se pelo menos um dos dois agentes envolvidos for Pro+, o match é gerado.
const PRO_PLANS = new Set(['pro', 'premium', 'agency']);

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private rankingService: RankingService,
  ) {}

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

  /**
   * Busca dados de plano para um conjunto de agentIds em uma única query.
   * Retorna:
   *  - boosts: agentId → bônus de score (para ordenação)
   *  - proSet: conjunto de agentIds que estão em planos Pro+ (para controle de match automático)
   */
  private async getAgentPlanData(
    agentIds: string[],
  ): Promise<{ boosts: Map<string, number>; proSet: Set<string> }> {
    const ids = [...new Set(agentIds.filter(Boolean))];
    if (!ids.length) return { boosts: new Map(), proSet: new Set() };
    const agents = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, plan: true },
    });
    const boosts = new Map<string, number>();
    const proSet = new Set<string>();
    for (const a of agents) {
      const plan = a.plan ?? 'free';
      boosts.set(a.id, PLAN_BOOST[plan] ?? 0);
      if (PRO_PLANS.has(plan)) proSet.add(a.id);
    }
    return { boosts, proSet };
  }

  /** Atalho retrocompatível — usa apenas o boosts do getAgentPlanData. */
  private async getPlanBoosts(agentIds: string[]): Promise<Map<string, number>> {
    return (await this.getAgentPlanData(agentIds)).boosts;
  }

  private async upsertMatch(buyerId: string, propertyId: string, score: number, planBonus = 0) {
    const finalScore = score + planBonus; // pode exceder 100; frontend exibe Math.min(score,100)
    const existing = await this.prisma.match.findUnique({
      where: { buyerId_propertyId: { buyerId, propertyId } },
    });

    if (existing) {
      await this.prisma.match.update({
        where: { buyerId_propertyId: { buyerId, propertyId } },
        data: { score: finalScore },
      });
      return { match: existing, isNew: false };
    }

    const match = await this.prisma.match.create({
      data: { buyerId, propertyId, score: finalScore },
    });
    return { match, isNew: true };
  }

  // ==================== MATCH MANUAL (botão "Verificar Matches") ====================

  async generateMatches(agentId: string) {
    const [myBuyers, myProperties, allBuyers, allProperties] = await Promise.all([
      this.prisma.buyer.findMany({ where: { agentId, status: 'ACTIVE' } }),
      this.prisma.property.findMany({ where: { agentId, status: 'AVAILABLE', isPublic: true } }),
      this.prisma.buyer.findMany({ where: { status: 'ACTIVE' } }),
      this.prisma.property.findMany({ where: { status: 'AVAILABLE', isPublic: true } }),
    ]);

    // Pré-carrega os bônus de plano de todos os agentes envolvidos
    const allPropertyAgentIds = allProperties.map((p) => p.agentId);
    const boostMap = await this.getPlanBoosts([agentId, ...allPropertyAgentIds]);
    const myBoost = boostMap.get(agentId) ?? 0;

    const THRESHOLD = 20;
    const processed = new Set<string>();
    let newMatches = 0;
    let existingMatches = 0;

    // Meus compradores × todos os imóveis: bônus do corretor do imóvel
    for (const buyer of myBuyers) {
      for (const property of allProperties) {
        const key = `${buyer.id}:${property.id}`;
        if (processed.has(key)) continue;
        processed.add(key);
        const score = this.calculateScore(buyer, property);
        if (score >= THRESHOLD) {
          try {
            const boost = boostMap.get(property.agentId) ?? 0;
            const result = await this.upsertMatch(buyer.id, property.id, score, boost);
            result.isNew ? newMatches++ : existingMatches++;
          } catch {}
        }
      }
    }

    // Todos os compradores × meus imóveis: meu bônus de plano
    for (const buyer of allBuyers) {
      for (const property of myProperties) {
        const key = `${buyer.id}:${property.id}`;
        if (processed.has(key)) continue;
        processed.add(key);
        const score = this.calculateScore(buyer, property);
        if (score >= THRESHOLD) {
          try {
            const result = await this.upsertMatch(buyer.id, property.id, score, myBoost);
            result.isNew ? newMatches++ : existingMatches++;
          } catch {}
        }
      }
    }

    return {
      message: newMatches > 0
        ? `${newMatches} novo(s) match(es) encontrado(s)`
        : 'Nenhum novo match encontrado',
      newMatches,
      existingMatches,
      total: newMatches + existingMatches,
    };
  }

  // ==================== MATCH AUTOMÁTICO (ao cadastrar comprador/imóvel, score ≥ 70) ====================

  // ── Regra de match automático entre corretores ─────────────────────────────
  // Match cross-agent só é gerado automaticamente se pelo menos um dos dois
  // agentes envolvidos (comprador ou imóvel) estiver em plano Pro, Premium ou Agency.
  // Matches dentro do próprio corretor (mesmo agentId) são sempre gerados.
  // O botão manual "Verificar Matches" não tem essa restrição.

  async generateForBuyer(buyerId: string): Promise<void> {
    try {
      const buyer = await this.prisma.buyer.findUnique({ where: { id: buyerId } });
      if (!buyer) return;

      const properties = await this.prisma.property.findMany({
        where: { status: 'AVAILABLE', isPublic: true },
      });

      const allAgentIds = [buyer.agentId, ...properties.map((p) => p.agentId)];
      const { boosts, proSet } = await this.getAgentPlanData(allAgentIds);
      const buyerAgentIsPro = proSet.has(buyer.agentId);

      for (const property of properties) {
        const isSameAgent = property.agentId === buyer.agentId;

        // Cross-agent: exige que pelo menos um dos dois seja Pro+
        if (!isSameAgent && !buyerAgentIsPro && !proSet.has(property.agentId)) continue;

        const score = this.calculateScore(buyer, property);
        if (score >= 70) {
          const boost = boosts.get(property.agentId) ?? 0;
          try { await this.upsertMatch(buyer.id, property.id, score, boost); } catch {}
        }
      }
    } catch { /* fire-and-forget: não bloqueia o cadastro */ }
  }

  async generateForProperty(propertyId: string): Promise<void> {
    try {
      const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
      if (!property || property.status !== 'AVAILABLE' || !property.isPublic) return;

      const buyers = await this.prisma.buyer.findMany({
        where: { status: 'ACTIVE' },
      });

      const allAgentIds = [property.agentId, ...buyers.map((b) => b.agentId)];
      const { boosts, proSet } = await this.getAgentPlanData(allAgentIds);
      const propertyAgentIsPro = proSet.has(property.agentId);
      const boost = boosts.get(property.agentId) ?? 0;

      for (const buyer of buyers) {
        const isSameAgent = buyer.agentId === property.agentId;

        // Cross-agent: exige que pelo menos um dos dois seja Pro+
        if (!isSameAgent && !propertyAgentIsPro && !proSet.has(buyer.agentId)) continue;

        const score = this.calculateScore(buyer, property);
        if (score >= 70) {
          try { await this.upsertMatch(buyer.id, property.id, score, boost); } catch {}
        }
      }
    } catch { /* fire-and-forget */ }
  }

  // ==================== LISTAGEM ====================

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
      this.prisma.partnership.findMany({
        where: {
          OR: [{ requesterId: agentId }, { receiverId: agentId }],
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
        select: { id: true, buyerId: true, propertyId: true, requesterId: true, receiverId: true, status: true },
      }),
    ]);

    const processed = matches.map((m) => {
      const isMine = m.buyer?.agent?.id === agentId;
      const otherAgentId = isMine ? m.property?.agentId : m.buyer?.agent?.id;

      const candidates = myPartnerships.filter(p => {
        const propertyMatch = p.propertyId === m.property?.id;
        const agentMatch = p.requesterId === otherAgentId || p.receiverId === otherAgentId;
        const buyerMatch = p.buyerId ? p.buyerId === m.buyer?.id : true;
        return propertyMatch && agentMatch && buyerMatch;
      });
      const partnership =
        candidates.find(p => p.status === 'ACCEPTED') ??
        candidates.find(p => p.status === 'PENDING') ??
        null;

      const partnershipAccepted = partnership?.status === 'ACCEPTED';
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
      include: {
        buyer:    { select: { agentId: true } },
        property: { select: { agentId: true } },
      },
    });
    if (!match) throw new Error('Match não encontrado');

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: status as any },
    });

    // ── Negócio fechado: +50 pts para ambos os corretores ─────────────────────
    if (status === 'CLOSED') {
      const buyerAgentId    = match.buyer?.agentId;
      const propertyAgentId = match.property?.agentId;

      if (buyerAgentId) {
        await this.rankingService.addScore(buyerAgentId, 50, 'dealsClosedCount');
      }
      if (propertyAgentId && propertyAgentId !== buyerAgentId) {
        await this.rankingService.addScore(propertyAgentId, 50, 'dealsClosedCount');
      }
    }

    return updated;
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
