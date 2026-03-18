import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { BuyerStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';
import { getPlanLimits } from '../common/plans.config';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class BuyersService {
  constructor(
    private prisma: PrismaService,
    private matchesService: MatchesService,
  ) {}

  async create(agentId: string, dto: CreateBuyerDto) {
    const agent = await this.prisma.user.findUnique({ where: { id: agentId }, select: { plan: true } });
    const limits = getPlanLimits(agent?.plan ?? 'free');

    if (limits.maxBuyers !== -1) {
      const count = await this.prisma.buyer.count({ where: { agentId, status: 'ACTIVE' } });
      if (count >= limits.maxBuyers) {
        throw new BadRequestException(
          `Seu plano ${agent?.plan ?? 'free'} permite até ${limits.maxBuyers} compradores. Faça upgrade para adicionar mais.`
        );
      }
    }

    const buyer = await this.prisma.buyer.create({ data: { ...dto, agentId } });

    // fire-and-forget: auto-match ao cadastrar comprador (score ≥ 70)
    this.matchesService.generateForBuyer(buyer.id);

    return buyer;
  }

  async findAll(agentId: string, query: any) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (page - 1) * limit;
    const where: any = { agentId };
    if (status) where.status = status;
    if (search) where.AND = [
      {
        OR: [
          { buyerName: { contains: search, mode: 'insensitive' } },
          { desiredCity: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];

    const [buyers, total] = await Promise.all([
      this.prisma.buyer.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
      }),
      this.prisma.buyer.count({ where }),
    ]);

    return { data: buyers, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, agentId: string) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { id },
      include: {
        matches: {
          include: { property: { select: { id: true, title: true, price: true, city: true, photos: true } } },
        },
      },
    });
    if (!buyer) throw new NotFoundException('Comprador não encontrado');
    if (buyer.agentId !== agentId) throw new ForbiddenException('Sem permissão');
    return buyer;
  }

  async update(id: string, agentId: string, dto: UpdateBuyerDto) {
    const buyer = await this.prisma.buyer.findUnique({ where: { id } });
    if (!buyer) throw new NotFoundException('Comprador não encontrado');
    if (buyer.agentId !== agentId) throw new ForbiddenException('Sem permissão');
    const { status, ...rest } = dto;
    return this.prisma.buyer.update({
      where: { id },
      data: { ...rest, ...(status && { status: status as BuyerStatus }) },
    });
  }

  async remove(id: string, agentId: string) {
    const buyer = await this.prisma.buyer.findUnique({ where: { id } });
    if (!buyer) throw new NotFoundException('Comprador não encontrado');
    if (buyer.agentId !== agentId) throw new ForbiddenException('Sem permissão');

    await this.prisma.match.deleteMany({ where: { buyerId: id } });

    return this.prisma.buyer.delete({ where: { id } });
  }
}
