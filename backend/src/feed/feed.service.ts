import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        user: { select: { id: true, name: true, avatarUrl: true, agency: true, city: true } },
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
          user: { select: { id: true, name: true, avatarUrl: true, agency: true, city: true, score: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }
}
