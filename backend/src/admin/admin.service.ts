import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePlan } from '../common/plans.config';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [usersCount, propertiesCount, buyersCount, matchesCount, partnershipsCount] = await Promise.all([
      this.prisma.user.count({ where: { role: 'AGENT' } }),
      this.prisma.property.count(),
      this.prisma.buyer.count(),
      this.prisma.match.count(),
      this.prisma.partnership.count(),
    ]);

    const recentUsers = await this.prisma.user.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, city: true, state: true, agency: true, createdAt: true, isActive: true },
    });

    return { usersCount, propertiesCount, buyersCount, matchesCount, partnershipsCount, recentUsers };
  }

  async listUsers(query: any) {
    const { page = 1, limit = 20, search, isActive } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: Number(limit),
        select: {
          id: true, name: true, email: true, phone: true, city: true, state: true,
          agency: true, role: true, plan: true, isActive: true, createdAt: true,
          _count: { select: { properties: true, buyers: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const normalized = users.map((u) => ({ ...u, plan: normalizePlan(u.plan) }));
    return { data: normalized, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async toggleUserStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  }

  async listProperties(query: any) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where, skip, take: Number(limit),
        include: { agent: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data: properties, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async removeProperty(id: string) {
    await this.prisma.match.deleteMany({ where: { propertyId: id } });
    return this.prisma.property.delete({ where: { id } });
  }
}
