import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnershipsService {
  constructor(private prisma: PrismaService) {}

  async request(requesterId: string, dto: { propertyId: string; receiverId: string; commissionSplit?: number; message?: string }) {
    if (requesterId === dto.receiverId) throw new BadRequestException('Não pode solicitar parceria consigo mesmo');

    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException('Imóvel não encontrado');

    const existing = await this.prisma.partnership.findFirst({
      where: {
        propertyId: dto.propertyId,
        OR: [
          { requesterId, receiverId: dto.receiverId },
          { requesterId: dto.receiverId, receiverId: requesterId },
        ],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });
    if (existing) throw new BadRequestException(
      existing.status === 'ACCEPTED'
        ? 'Já existe uma parceria aceita para este imóvel'
        : 'Já existe uma solicitação de parceria pendente'
    );

    return this.prisma.partnership.create({
      data: { ...dto, requesterId },
      include: {
        property: { select: { id: true, title: true, price: true } },
        requester: { select: { id: true, name: true, phone: true, email: true } },
        receiver: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async findAll(userId: string, query: any) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: any = { OR: [{ requesterId: userId }, { receiverId: userId }] };
    if (status) where.status = status;

    const [partnerships, total] = await Promise.all([
      this.prisma.partnership.findMany({
        where, skip, take: Number(limit),
        include: {
          property: { select: { id: true, title: true, price: true, city: true, photos: true } },
          requester: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
          receiver: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnership.count({ where }),
    ]);

    return { data: partnerships, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async respond(id: string, userId: string, status: 'ACCEPTED' | 'REJECTED', commissionSplit?: number) {
    const partnership = await this.prisma.partnership.findUnique({ where: { id } });
    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.receiverId !== userId) throw new ForbiddenException('Sem permissão');
    if (partnership.status !== 'PENDING') throw new BadRequestException('Parceria já foi respondida');

    return this.prisma.partnership.update({
      where: { id },
      data: { status, ...(commissionSplit && { commissionSplit }) },
      include: {
        property: { select: { id: true, title: true } },
        requester: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const partnership = await this.prisma.partnership.findUnique({ where: { id } });
    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.requesterId !== userId) throw new ForbiddenException('Sem permissão');
    return this.prisma.partnership.update({ where: { id }, data: { status: 'CANCELLED' } });
  }
}
