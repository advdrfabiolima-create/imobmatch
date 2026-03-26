import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateEarlyAccessLeadDto } from './dto/early-access.dto';

@Injectable()
export class EarlyAccessService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  // ── Cadastro público ────────────────────────────────────────────────────────

  async create(dto: CreateEarlyAccessLeadDto) {
    const existing = await this.prisma.earlyAccessLead.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Este e-mail já está na lista de acesso antecipado.');
    }

    return this.prisma.earlyAccessLead.create({
      data: {
        fullName: dto.fullName,
        email:    dto.email,
        whatsapp: dto.whatsapp,
        source:   dto.source ?? 'facebook_group',
      },
      select: { id: true, fullName: true, email: true, createdAt: true },
    });
  }

  // ── Admin: listagem com filtros ─────────────────────────────────────────────

  async findAll(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email:    { contains: search, mode: 'insensitive' } },
      { whatsapp: { contains: search, mode: 'insensitive' } },
    ];

    const [leads, total] = await Promise.all([
      this.prisma.earlyAccessLead.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.earlyAccessLead.count({ where }),
    ]);

    return { data: leads, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  // ── Admin: convidar um lead ─────────────────────────────────────────────────

  async invite(id: string) {
    const lead = await this.prisma.earlyAccessLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado.');

    if (lead.status === 'REGISTERED') {
      return { message: 'Este lead já se cadastrou na plataforma.', lead };
    }

    const updated = await this.prisma.earlyAccessLead.update({
      where: { id },
      data: { status: 'INVITED', invitedAt: new Date() },
    });

    // fire-and-forget
    this.mail.sendEarlyAccessInvite(lead.email, lead.fullName).catch(() => {});

    return { message: 'Convite enviado com sucesso.', lead: updated };
  }

  // ── Admin: convidar em massa ────────────────────────────────────────────────

  async inviteBulk(ids: string[]) {
    const leads = await this.prisma.earlyAccessLead.findMany({
      where: { id: { in: ids }, status: 'WAITING' },
    });

    if (leads.length === 0) {
      return { sent: 0, message: 'Nenhum lead elegível encontrado (apenas WAITING).' };
    }

    await this.prisma.earlyAccessLead.updateMany({
      where: { id: { in: leads.map(l => l.id) } },
      data: { status: 'INVITED', invitedAt: new Date() },
    });

    // fire-and-forget por lead
    for (const lead of leads) {
      this.mail.sendEarlyAccessInvite(lead.email, lead.fullName).catch(() => {});
    }

    return { sent: leads.length, message: `${leads.length} convite(s) enviado(s).` };
  }

  // ── Admin: excluir lead ─────────────────────────────────────────────────────

  async remove(id: string) {
    const lead = await this.prisma.earlyAccessLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado.');
    await this.prisma.earlyAccessLead.delete({ where: { id } });
    return { message: 'Lead removido com sucesso.' };
  }

  // ── Admin: exportar CSV ─────────────────────────────────────────────────────

  async exportCsv() {
    const leads = await this.prisma.earlyAccessLead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const STATUS_PT: Record<string, string> = {
      WAITING:    'Aguardando',
      INVITED:    'Convidado',
      REGISTERED: 'Cadastrado',
    };

    const header = 'Nome,Email,WhatsApp,Status,Cadastro,Convidado em';
    const rows = leads.map(l =>
      [
        `"${l.fullName.trim()}"`,
        `"${l.email}"`,
        `"${l.whatsapp ?? ''}"`,
        STATUS_PT[l.status] ?? l.status,
        l.createdAt.toISOString().slice(0, 10),
        l.invitedAt ? l.invitedAt.toISOString().slice(0, 10) : '',
      ].join(',')
    );

    return [header, ...rows].join('\n');
  }

  // ── Chamado pelo AuthService ao registrar ───────────────────────────────────

  async markAsRegistered(email: string) {
    await this.prisma.earlyAccessLead.updateMany({
      where: { email, status: { not: 'REGISTERED' } },
      data: { status: 'REGISTERED' },
    }).catch(() => {}); // silencioso — e-mail pode não estar na lista
  }

  // ── Contagem pública ────────────────────────────────────────────────────────

  async count() {
    return this.prisma.earlyAccessLead.count();
  }
}
