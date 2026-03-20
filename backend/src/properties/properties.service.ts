import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { getPlanLimits, isWithinLimit } from '../common/plans.config';
import { MatchesService } from '../matches/matches.service';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private matchesService: MatchesService,
    private rankingService: RankingService,
  ) {}

  async create(agentId: string, dto: CreatePropertyDto) {
    const agent = await this.prisma.user.findUnique({ where: { id: agentId }, select: { plan: true } });
    const limits = getPlanLimits(agent?.plan ?? 'free');

    if (!isWithinLimit(-1, limits.maxProperties)) {
      // unlimited
    } else if (limits.maxProperties !== -1) {
      const count = await this.prisma.property.count({ where: { agentId, status: { not: 'INACTIVE' } } });
      if (count >= limits.maxProperties) {
        throw new BadRequestException(
          `Seu plano ${agent?.plan ?? 'free'} permite até ${limits.maxProperties} imóveis. Faça upgrade para adicionar mais.`
        );
      }
    }

    const property = await this.prisma.property.create({
      data: { ...dto, agentId },
      include: { agent: { select: { id: true, name: true, phone: true, email: true } } },
    });

    // fire-and-forget: auto-match ao cadastrar imóvel (score ≥ 70)
    this.matchesService.generateForProperty(property.id);

    return property;
  }

  async findAll(query: {
    city?: string; state?: string; type?: string; minPrice?: number; maxPrice?: number;
    bedrooms?: number; search?: string; page?: number; limit?: number; agentId?: string;
  }) {
    const { city, state, type, minPrice, maxPrice, bedrooms, search, page = 1, limit = 20, agentId } = query;
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true, status: 'AVAILABLE' };
    if (agentId) { where.agentId = agentId; delete where.isPublic; delete where.status; }
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state;
    if (type) where.type = type;
    if (bedrooms) where.bedrooms = { gte: Number(bedrooms) };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { neighborhood: { contains: search, mode: 'insensitive' } },
    ];

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where, skip, take: Number(limit),
        include: { agent: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data: properties, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true, agency: true, city: true } },
        _count: { select: { matches: true, partnerships: true } },
      },
    });
    if (!property) throw new NotFoundException('Imóvel não encontrado');
    return property;
  }

  async update(id: string, agentId: string, dto: UpdatePropertyDto, role?: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Imóvel não encontrado');
    if (property.agentId !== agentId && role !== 'ADMIN') throw new ForbiddenException('Sem permissão');
    const { status, ...rest } = dto;
    const updated = await this.prisma.property.update({
      where: { id },
      data: { ...rest, ...(status && { status: status as PropertyStatus }) },
    });

    // Imóvel marcado como VENDIDO: +50 pts para o corretor
    if (status === 'SOLD' && property.status !== 'SOLD') {
      this.rankingService.addScore(property.agentId, 50, 'dealsClosedCount').catch(() => {});
    }

    // Imóvel marcado como ALUGADO: +20 pts para o corretor
    if (status === 'RENTED' && property.status !== 'RENTED') {
      this.rankingService.addScore(property.agentId, 20, 'dealsClosedCount').catch(() => {});
    }

    return updated;
  }

  async remove(id: string, agentId: string, role?: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Imóvel não encontrado');
    if (property.agentId !== agentId && role !== 'ADMIN') throw new ForbiddenException('Sem permissão');

    await this.prisma.match.deleteMany({ where: { propertyId: id } });

    return this.prisma.property.delete({ where: { id } });
  }

  async getMyProperties(agentId: string, query: any) {
    const { page = 1, limit = 20, status, search, city, state } = query;
    const skip = (page - 1) * limit;
    const where: any = { agentId };
    if (status) where.status = status;
    if (state) where.state = state;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { neighborhood: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where, skip, take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { matches: true } } },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data: properties, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }
}
