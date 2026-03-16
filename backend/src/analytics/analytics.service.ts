import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics(agentId: string) {
    const now = new Date();

    // ── 1. Overview counts ────────────────────────────────────────────────
    const [
      totalProperties,
      totalBuyers,
      totalMatches,
      totalPartnerships,
      closedMatches,
    ] = await Promise.all([
      this.prisma.property.count({ where: { agentId } }),
      this.prisma.buyer.count({ where: { agentId } }),
      this.prisma.match.count({
        where: { OR: [{ buyer: { agentId } }, { property: { agentId } }] },
      }),
      this.prisma.partnership.count({
        where: { OR: [{ requesterId: agentId }, { receiverId: agentId }] },
      }),
      this.prisma.match.count({
        where: {
          status: 'CLOSED',
          OR: [{ buyer: { agentId } }, { property: { agentId } }],
        },
      }),
    ]);

    const conversionRate =
      totalMatches > 0 ? Math.round((closedMatches / totalMatches) * 100) : 0;

    // ── 2. Matches by status ──────────────────────────────────────────────
    const matchStatusGroups = await this.prisma.match.groupBy({
      by: ['status'],
      where: { OR: [{ buyer: { agentId } }, { property: { agentId } }] },
      _count: { status: true },
    });

    const statusLabels: Record<string, string> = {
      PENDING: 'Pendente',
      CONTACTED: 'Contactado',
      VISITED: 'Visitado',
      NEGOTIATING: 'Em negociação',
      CLOSED: 'Fechado',
      REJECTED: 'Rejeitado',
    };

    const matchesByStatus = matchStatusGroups.map((g) => ({
      status: statusLabels[g.status] || g.status,
      count: g._count.status,
    }));

    // ── 3. Properties by type ─────────────────────────────────────────────
    const propTypeGroups = await this.prisma.property.groupBy({
      by: ['type'],
      where: { agentId },
      _count: { type: true },
    });

    const typeLabels: Record<string, string> = {
      APARTMENT: 'Apartamento',
      HOUSE: 'Casa',
      LAND: 'Terreno',
      COMMERCIAL: 'Comercial',
      RURAL: 'Rural',
    };

    const propertiesByType = propTypeGroups.map((g) => ({
      type: typeLabels[g.type] || g.type,
      count: g._count.type,
    }));

    // ── 4. Monthly evolution (last 6 months) ──────────────────────────────
    const monthlyEvolution = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(now, 5 - i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const label = format(date, 'MMM/yy');

        return Promise.all([
          this.prisma.property.count({
            where: { agentId, createdAt: { gte: start, lte: end } },
          }),
          this.prisma.buyer.count({
            where: { agentId, createdAt: { gte: start, lte: end } },
          }),
          this.prisma.match.count({
            where: {
              createdAt: { gte: start, lte: end },
              OR: [{ buyer: { agentId } }, { property: { agentId } }],
            },
          }),
        ]).then(([properties, buyers, matches]) => ({
          month: label,
          properties,
          buyers,
          matches,
        }));
      }),
    );

    // ── 5. Top properties by match count ─────────────────────────────────
    const topPropertiesRaw = await this.prisma.property.findMany({
      where: { agentId },
      select: {
        id: true,
        title: true,
        city: true,
        type: true,
        _count: { select: { matches: true } },
      },
      orderBy: { matches: { _count: 'desc' } },
      take: 5,
    });

    const topProperties = topPropertiesRaw.map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      type: typeLabels[p.type] || p.type,
      matchCount: p._count.matches,
    }));

    // ── 6. Partnership stats ──────────────────────────────────────────────
    const partnershipGroups = await this.prisma.partnership.groupBy({
      by: ['status'],
      where: { OR: [{ requesterId: agentId }, { receiverId: agentId }] },
      _count: { status: true },
    });

    const partnershipStats = { pending: 0, accepted: 0, rejected: 0 };
    for (const g of partnershipGroups) {
      if (g.status === 'PENDING') partnershipStats.pending = g._count.status;
      if (g.status === 'ACCEPTED') partnershipStats.accepted = g._count.status;
      if (g.status === 'REJECTED') partnershipStats.rejected = g._count.status;
    }

    // ── 7. Score distribution ─────────────────────────────────────────────
    const allScores = await this.prisma.match.findMany({
      where: { OR: [{ buyer: { agentId } }, { property: { agentId } }] },
      select: { score: true },
    });

    const scoreBuckets = [
      { range: '30–49', min: 30, max: 49 },
      { range: '50–69', min: 50, max: 69 },
      { range: '70–84', min: 70, max: 84 },
      { range: '85–100', min: 85, max: 100 },
    ].map((b) => ({
      range: b.range,
      count: allScores.filter((m) => m.score >= b.min && m.score <= b.max).length,
    }));

    return {
      overview: {
        totalProperties,
        totalBuyers,
        totalMatches,
        totalPartnerships,
        closedMatches,
        conversionRate,
      },
      matchesByStatus,
      propertiesByType,
      monthlyEvolution,
      topProperties,
      partnershipStats,
      scoreBuckets,
    };
  }
}
