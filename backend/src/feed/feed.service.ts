import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_LIMITS, PlanType } from '../common/plans.config';

// Ordem de prioridade: premium/agency > pro > starter > free
const PLAN_ORDER: PlanType[] = ['premium', 'agency', 'pro', 'starter', 'free'];

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: {
    type: 'client' | 'property' | 'partnership' | 'opportunity';
    content: string;
    referenceId?: string;
  }) {
    return this.prisma.post.create({
      data: { ...dto, userId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, agency: true, city: true, plan: true } },
      },
    });
  }

  async findAll(query: any) {
    const { type, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, agency: true, city: true, plan: true, score: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Ordena posts: planos de maior prioridade aparecem primeiro dentro da mesma "janela de tempo"
    const sorted = data.sort((a, b) => {
      const aPriority = PLAN_LIMITS[(a.user?.plan ?? 'free') as PlanType]?.feedPriority ?? 0;
      const bPriority = PLAN_LIMITS[(b.user?.plan ?? 'free') as PlanType]?.feedPriority ?? 0;
      if (bPriority !== aPriority) return bPriority - aPriority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { data: sorted, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }
}
