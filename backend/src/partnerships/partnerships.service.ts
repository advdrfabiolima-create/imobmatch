import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartnershipsService {
  constructor(private prisma: PrismaService) {}

  private extractIp(req: any): string | null {
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (forwarded) return String(forwarded).split(',')[0].trim();
    return req?.ip ?? req?.socket?.remoteAddress ?? null;
  }

  async request(
    requesterId: string,
    dto: { buyerId?: string; propertyId: string; receiverId: string; commissionSplit?: number; message?: string },
    req?: any,
  ) {
    if (requesterId === dto.receiverId)
      throw new BadRequestException('Não pode solicitar parceria consigo mesmo');

    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException('Imóvel não encontrado');

    const existing = await this.prisma.partnership.findFirst({
      where: {
        propertyId: dto.propertyId,
        // if buyerId is provided, scope the uniqueness check to that buyer
        ...(dto.buyerId ? { buyerId: dto.buyerId } : {}),
        OR: [
          { requesterId, receiverId: dto.receiverId },
          { requesterId: dto.receiverId, receiverId: requesterId },
        ],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });
    if (existing)
      throw new BadRequestException(
        existing.status === 'ACCEPTED'
          ? 'Já existe uma parceria aceita para este match'
          : 'Já existe uma solicitação de parceria pendente para este match',
      );

    return this.prisma.partnership.create({
      data: { ...dto, requesterId, requesterIp: this.extractIp(req) },
      include: {
        property: { select: { id: true, title: true, price: true } },
        requester: { select: { id: true, name: true, phone: true, email: true } },
        receiver:  { select: { id: true, name: true, phone: true, email: true } },
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
          property:  { select: { id: true, title: true, price: true, city: true, photos: true } },
          requester: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
          receiver:  { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
          buyer:     { select: { id: true, buyerName: true } },
      },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnership.count({ where }),
    ]);

    return { data: partnerships, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async respond(
    id: string,
    userId: string,
    status: 'ACCEPTED' | 'REJECTED',
    commissionSplit?: number,
    req?: any,
  ) {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
      include: { property: true, requester: true, receiver: true },
    });
    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.receiverId !== userId) throw new ForbiddenException('Sem permissão');
    if (partnership.status !== 'PENDING') throw new BadRequestException('Parceria já foi respondida');

    const acceptedAt = status === 'ACCEPTED' ? new Date() : null;
    const finalCommission = commissionSplit ?? Number(partnership.commissionSplit) ?? null;
    const receiverIp = this.extractIp(req);

    let agreementHash: string | null = null;
    if (status === 'ACCEPTED') {
      agreementHash = createHash('sha256')
        .update(
          [
            id,
            partnership.requesterId,
            partnership.receiverId,
            partnership.propertyId,
            finalCommission ?? '',
            acceptedAt!.toISOString(),
          ].join(':'),
        )
        .digest('hex');
    }

    return this.prisma.partnership.update({
      where: { id },
      data: {
        status,
        ...(finalCommission && { commissionSplit: finalCommission }),
        ...(status === 'ACCEPTED' && { receiverIp, acceptedAt, agreementHash }),
      },
      include: {
        property:  { select: { id: true, title: true } },
        requester: { select: { id: true, name: true } },
        receiver:  { select: { id: true, name: true } },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const partnership = await this.prisma.partnership.findUnique({ where: { id } });
    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.requesterId !== userId) throw new ForbiddenException('Sem permissão');
    return this.prisma.partnership.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async getAgreement(id: string, userId: string) {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
      include: {
        property:  { select: { id: true, title: true, price: true, city: true, neighborhood: true, type: true } },
        requester: { select: { id: true, name: true, email: true, phone: true, creci: true, agency: true } },
        receiver:  { select: { id: true, name: true, email: true, phone: true, creci: true, agency: true } },
      },
    });

    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.requesterId !== userId && partnership.receiverId !== userId)
      throw new ForbiddenException('Sem permissão');
    if (partnership.status !== 'ACCEPTED')
      throw new BadRequestException('O termo só está disponível após a parceria ser aceita');

    return partnership;
  }
}
