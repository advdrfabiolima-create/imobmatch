import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_LIMITS, PlanType } from '../common/plans.config';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(agentId: string, dto: {
    title: string;
    propertyType: string;
    priceNormal: number;
    priceUrgent: number;
    city: string;
    neighborhood?: string;
    description?: string;
    acceptsOffer?: boolean;
    photoUrl?: string;
    propertyId?: string;
  }) {
    const opportunity = await this.prisma.opportunity.create({
      data: {
        title:        dto.title,
        propertyType: dto.propertyType as PropertyType,
        priceNormal:  dto.priceNormal,
        priceUrgent:  dto.priceUrgent,
        city:         dto.city,
        neighborhood: dto.neighborhood,
        description:  dto.description,
        acceptsOffer: dto.acceptsOffer ?? false,
        photoUrl:     dto.photoUrl,
        propertyId:   dto.propertyId,
        agentId,
      },
      include: {
        agent:    { select: { id: true, name: true, phone: true, avatarUrl: true, agency: true } },
        property: { select: { photos: true } },
      },
    });

    await this.prisma.post.create({
      data: {
        userId:      agentId,
        type:        'opportunity',
        content:     `Nova oportunidade urgente: ${dto.title} em ${dto.city} por R$ ${Number(dto.priceUrgent).toLocaleString('pt-BR')}`,
        referenceId: opportunity.id,
      },
    });

    return opportunity;
  }

  async findAll(query: any) {
    const { city, maxPrice, minPrice, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { status: 'active' };
    if (city)     where.city        = { contains: city, mode: 'insensitive' };
    if (maxPrice) where.priceUrgent = { lte: Number(maxPrice) };
    if (minPrice) where.priceUrgent = { ...where.priceUrgent, gte: Number(minPrice) };

    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          agent:    { select: { id: true, name: true, phone: true, avatarUrl: true, agency: true, plan: true } },
          property: { select: { photos: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    const sorted = data.sort((a, b) => {
      const aPriority = PLAN_LIMITS[(a.agent?.plan ?? 'free') as PlanType]?.feedPriority ?? 0;
      const bPriority = PLAN_LIMITS[(b.agent?.plan ?? 'free') as PlanType]?.feedPriority ?? 0;
      if (bPriority !== aPriority) return bPriority - aPriority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { data: sorted, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        agent:    { select: { id: true, name: true, phone: true, email: true, avatarUrl: true, agency: true, creci: true } },
        property: { select: { photos: true } },
      },
    });
    if (!opportunity) throw new NotFoundException('Oportunidade não encontrada');
    return opportunity;
  }

  async updateStatus(id: string, agentId: string, status: 'active' | 'paused' | 'closed' | 'removed') {
    const opp = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opp)               throw new NotFoundException('Oportunidade não encontrada');
    if (opp.agentId !== agentId) throw new ForbiddenException('Sem permissão');
    return this.prisma.opportunity.update({ where: { id }, data: { status } });
  }

  async remove(id: string, agentId: string) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opp)               throw new NotFoundException('Oportunidade não encontrada');
    if (opp.agentId !== agentId) throw new ForbiddenException('Sem permissão');
    return this.prisma.opportunity.delete({ where: { id } });
  }
}
