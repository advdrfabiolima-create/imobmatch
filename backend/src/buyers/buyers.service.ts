import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BuyerStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';

@Injectable()
export class BuyersService {
  constructor(private prisma: PrismaService) {}

  async create(agentId: string, dto: CreateBuyerDto) {
    return this.prisma.buyer.create({ data: { ...dto, agentId } });
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
