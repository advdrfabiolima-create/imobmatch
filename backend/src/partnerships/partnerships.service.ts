import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PartnershipsService {
  constructor(
    private prisma: PrismaService,
    private rankingService: RankingService,
    private mailService: MailService,
  ) {}

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

    const partnership = await this.prisma.partnership.create({
      data: { ...dto, requesterId, requesterIp: this.extractIp(req) },
      include: {
        property: { select: { id: true, title: true, price: true, city: true } },
        requester: { select: { id: true, name: true, phone: true, email: true } },
        receiver:  { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    // fire-and-forget: notifica o corretor receptor por e-mail
    this.mailService.sendPartnershipRequestEmail(
      partnership.receiver.email,
      partnership.receiver.name,
      partnership.requester.name,
      partnership.requester.phone ?? null,
      partnership.property.title,
      partnership.property.city ?? null,
    ).catch(() => {});

    return partnership;
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

    const updated = await this.prisma.partnership.update({
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

    // +10 pontos para ambos quando parceria é aceita
    if (status === 'ACCEPTED') {
      await Promise.all([
        this.rankingService.addScore(partnership.requesterId, 10, 'partnershipsCount'),
        this.rankingService.addScore(partnership.receiverId, 10, 'partnershipsCount'),
      ]);
    }

    return updated;
  }

  async cancel(id: string, userId: string) {
    const partnership = await this.prisma.partnership.findUnique({ where: { id } });
    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.requesterId !== userId) throw new ForbiddenException('Sem permissão');
    return this.prisma.partnership.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async closeDeal(id: string, userId: string, reason: 'deal_closed' | 'not_closed' | 'buyer_quit') {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
      include: {
        buyer:     true,
        requester: { select: { id: true, name: true, email: true } },
        receiver:  { select: { id: true, name: true, email: true } },
        property:  { select: { title: true } },
      },
    });
    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.requesterId !== userId && partnership.receiverId !== userId)
      throw new ForbiddenException('Sem permissão');
    if (partnership.status !== 'ACCEPTED')
      throw new BadRequestException('Apenas parcerias ativas podem ser encerradas');

    // Negócio fechado → status CLOSED; sem negócio → CANCELLED
    const newStatus = reason === 'deal_closed' ? 'CLOSED' : 'CANCELLED';
    await this.prisma.partnership.update({ where: { id }, data: { status: newStatus } });

    if (reason === 'deal_closed') {
      // +50 pts para ambos + email de parabéns
      await Promise.all([
        this.rankingService.addScore(partnership.requesterId, 50, 'dealsClosedCount'),
        this.rankingService.addScore(partnership.receiverId,  50, 'dealsClosedCount'),
      ]);
      const commission = partnership.commissionSplit ? Number(partnership.commissionSplit) : null;
      this.mailService.sendDealClosedEmail(
        partnership.requester.email, partnership.requester.name,
        partnership.receiver.name, partnership.property.title, commission,
      ).catch(() => {});
      this.mailService.sendDealClosedEmail(
        partnership.receiver.email, partnership.receiver.name,
        partnership.requester.name, partnership.property.title, commission,
      ).catch(() => {});
      return { message: 'Negócio fechado! +50 pts para ambos os corretores.' };
    }

    if (reason === 'buyer_quit' && partnership.buyerId) {
      await this.prisma.buyer.update({ where: { id: partnership.buyerId }, data: { status: 'INACTIVE' } });
      await this.prisma.match.updateMany({ where: { buyerId: partnership.buyerId }, data: { status: 'REJECTED' } });
    }

    return { message: reason === 'buyer_quit' ? 'Parceria encerrada e comprador inativado' : 'Parceria encerrada' };
  }

  async remove(id: string, userId: string) {
    const partnership = await this.prisma.partnership.findUnique({ where: { id } });
    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (partnership.requesterId !== userId && partnership.receiverId !== userId)
      throw new ForbiddenException('Sem permissão');
    const deletable: string[] = ['REJECTED', 'CANCELLED', 'CLOSED'];
    if (!deletable.includes(partnership.status))
      throw new BadRequestException('Apenas parcerias encerradas podem ser deletadas');
    await this.prisma.partnership.delete({ where: { id } });
    return { message: 'Parceria removida' };
  }

  async verify(id: string) {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
      include: {
        property:  { select: { title: true, city: true, type: true } },
        requester: { select: { name: true, creci: true, agency: true } },
        receiver:  { select: { name: true, creci: true, agency: true } },
      },
    });

    if (!partnership) throw new NotFoundException('Parceria não encontrada');
    if (!partnership.agreementHash) {
      return { valid: false, reason: 'Parceria ainda não foi aceita — nenhum documento gerado.' };
    }

    const recalculated = createHash('sha256')
      .update(
        [
          id,
          partnership.requesterId,
          partnership.receiverId,
          partnership.propertyId,
          partnership.commissionSplit ?? '',
          partnership.acceptedAt!.toISOString(),
        ].join(':'),
      )
      .digest('hex');

    const valid = recalculated === partnership.agreementHash;

    return {
      valid,
      partnershipId: id,
      hash: partnership.agreementHash,
      acceptedAt: partnership.acceptedAt,
      commissionSplit: partnership.commissionSplit,
      property: partnership.property,
      requester: partnership.requester,
      receiver:  partnership.receiver,
      ...(valid ? {} : { reason: 'O hash recalculado não corresponde ao hash registrado. Documento pode ter sido adulterado.' }),
    };
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
    if (!['ACCEPTED', 'CLOSED'].includes(partnership.status))
      throw new BadRequestException('O termo só está disponível após a parceria ser aceita');

    return partnership;
  }
}
