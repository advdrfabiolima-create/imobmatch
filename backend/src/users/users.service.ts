import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(query: { city?: string; state?: string; search?: string; page?: number; limit?: number }) {
    const { city, state, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true, role: 'AGENT' };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state;
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { agency: { contains: search, mode: 'insensitive' } },
    ];

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true, name: true, email: true, phone: true, city: true,
          state: true, agency: true, creci: true, bio: true, avatarUrl: true, createdAt: true,
          score: true,
          _count: { select: { properties: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, city: true,
        state: true, agency: true, creci: true, bio: true, avatarUrl: true, createdAt: true,
        properties: {
          where: { isPublic: true, status: 'AVAILABLE' },
          select: {
            id: true, title: true, type: true, price: true, city: true,
            neighborhood: true, bedrooms: true, bathrooms: true, areaM2: true,
            photos: true, createdAt: true,
          },
          take: 10,
        },
        _count: { select: { properties: true, buyers: true } },
      },
    });
    if (!user) throw new NotFoundException('Corretor não encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, name: true, email: true, phone: true, city: true,
        state: true, agency: true, creci: true, bio: true, avatarUrl: true,
        cpfCnpj: true, personType: true, notifyMatchEmail: true, updatedAt: true,
      },
    });
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  async ping(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastSeen: new Date() },
      select: { id: true },
    });
  }

  async completeOnboarding(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isFirstLogin: false },
      select: { id: true, isFirstLogin: true },
    });
  }

  async changePlan(id: string, plan: 'starter' | 'professional' | 'agency') {
    return this.prisma.user.update({
      where: { id },
      data: { plan },
      select: { id: true, plan: true },
    });
  }

  async deleteAccount(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    if (user) {
      this.mailService.sendAccountDeletedEmail(user.email, user.name);
    }

    return { success: true };
  }

  async getDashboardStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { city: true, state: true },
    });

    const [propertiesCount, buyersCount, matchesCount, partnershipsPending, networkPropertiesCount, networkBuyersCount] = await Promise.all([
      this.prisma.property.count({ where: { agentId: userId } }),
      this.prisma.buyer.count({ where: { agentId: userId, status: 'ACTIVE' } }),
      this.prisma.match.count({
        where: { OR: [{ buyer: { agentId: userId } }, { property: { agentId: userId } }] },
      }),
      this.prisma.partnership.count({ where: { receiverId: userId, status: 'PENDING' } }),
      this.prisma.property.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.buyer.count({ where: { status: 'ACTIVE' } }),
    ]);

    // Compradores sem nenhum match (precisam de imóvel)
    const buyersWithCounts = await this.prisma.buyer.findMany({
      where: { agentId: userId, status: 'ACTIVE' },
      select: { id: true, buyerName: true, desiredCity: true, maxPrice: true, propertyType: true,
                _count: { select: { matches: true } } },
      take: 30,
    });
    const unmatchedBuyers = buyersWithCounts.filter(b => b._count.matches === 0).slice(0, 3);

    // Imóveis disponíveis sem matches
    const propsWithCounts = await this.prisma.property.findMany({
      where: { agentId: userId, status: 'AVAILABLE' },
      select: { id: true, title: true, type: true, price: true, city: true,
                _count: { select: { matches: true } } },
      take: 30,
    });
    const propertiesWithoutMatches = propsWithCounts.filter(p => p._count.matches === 0).slice(0, 3);

    // Oportunidades da rede na cidade do usuário
    const networkOpportunities = user?.city
      ? await this.prisma.opportunity.findMany({
          where: {
            status: 'active',
            city: { contains: user.city, mode: 'insensitive' },
            agentId: { not: userId },
          },
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, title: true, city: true, priceUrgent: true, priceNormal: true,
            propertyType: true, createdAt: true,
            agent: { select: { name: true, phone: true } },
          },
        })
      : [];

    const recentProperties = await this.prisma.property.findMany({
      where: { agentId: userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, type: true, price: true, status: true, createdAt: true },
    });

    const recentMatches = await this.prisma.match.findMany({
      where: { OR: [{ buyer: { agentId: userId } }, { property: { agentId: userId } }] },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer:    { select: { buyerName: true, desiredCity: true, maxPrice: true } },
        property: { select: { title: true, price: true, city: true } },
      },
    });

    const recentPartnerships = await this.prisma.partnership.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        status: 'ACCEPTED',
      },
      take: 3,
      orderBy: { acceptedAt: 'desc' },
      include: {
        requester: { select: { name: true } },
        receiver:  { select: { name: true } },
        property:  { select: { title: true, city: true } },
      },
    });

    const myOpportunities = await this.prisma.opportunity.findMany({
      where: { agentId: userId, status: 'active' },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, city: true, priceUrgent: true, createdAt: true },
    });

    return {
      propertiesCount, buyersCount, matchesCount, partnershipsPending,
      networkPropertiesCount, networkBuyersCount,
      recentProperties, recentMatches, recentPartnerships, myOpportunities,
      unmatchedBuyers, propertiesWithoutMatches, networkOpportunities,
      userCity: user?.city ?? null,
    };
  }
}
