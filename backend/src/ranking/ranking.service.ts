import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AgentLevel = 'Bronze' | 'Silver' | 'Gold';

export function getLevel(score: number): AgentLevel {
  if (score >= 200) return 'Gold';
  if (score >= 80) return 'Silver';
  return 'Bronze';
}

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(query: any) {
    const { page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'AGENT' },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          agency: true,
          city: true,
          state: true,
          score: true,
          partnershipsCount: true,
          dealsClosedCount: true,
        },
        orderBy: { score: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.user.count({ where: { role: 'AGENT' } }),
    ]);

    const ranked = users.map((u, index) => ({
      ...u,
      rank: skip + index + 1,
      level: getLevel(u.score),
    }));

    return { data: ranked, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async addScore(userId: string, points: number, field?: 'partnershipsCount' | 'dealsClosedCount') {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        score: { increment: points },
        ...(field ? { [field]: { increment: 1 } } : {}),
      },
    });
  }
}
