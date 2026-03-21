import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private async getAgent(agentId: string) {
    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Usuário não encontrado');
    return agent;
  }

  async getMembers(agentId: string) {
    const agent = await this.getAgent(agentId);

    const where: any = agent.agency
      ? { agency: agent.agency, isActive: true }
      : { id: agentId };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, avatarUrl: true, createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(agentId: string, email: string, role: 'ADMIN' | 'AGENT') {
    const agent = await this.getAgent(agentId);

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.agency === agent.agency) {
        return { message: 'Usuário já faz parte da equipe.' };
      }
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { agency: agent.agency ?? undefined, role },
      });
      return { message: `${existing.name} adicionado(a) à equipe!` };
    }

    // Delete any existing pending invite for this email
    await this.prisma.teamInvite.deleteMany({ where: { email } });

    const agencyName = agent.agency ?? agent.name;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    const invite = await this.prisma.teamInvite.create({
      data: { email, role, agency: agencyName, invitedById: agentId, expiresAt },
    });

    await this.mailService.sendTeamInviteEmail(email, agent.name, agencyName, role, invite.token);

    return {
      message: `Convite enviado para ${email}! O usuário receberá um e-mail com o link para criar a conta.`,
      invited: true,
      email,
    };
  }

  async getInviteByToken(token: string) {
    const invite = await this.prisma.teamInvite.findUnique({ where: { token } });
    if (!invite) throw new NotFoundException('Convite não encontrado ou já utilizado.');
    if (invite.expiresAt < new Date()) {
      await this.prisma.teamInvite.delete({ where: { token } });
      throw new BadRequestException('Este convite expirou. Peça ao administrador para enviar um novo convite.');
    }
    return { email: invite.email, role: invite.role, agency: invite.agency };
  }

  async acceptInvite(token: string, name: string, password: string) {
    const invite = await this.prisma.teamInvite.findUnique({ where: { token } });
    if (!invite) throw new NotFoundException('Convite não encontrado ou já utilizado.');
    if (invite.expiresAt < new Date()) {
      await this.prisma.teamInvite.delete({ where: { token } });
      throw new BadRequestException('Este convite expirou.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: invite.email } });
    if (existing) throw new ConflictException('Já existe uma conta com este e-mail.');

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: {
        name,
        email: invite.email,
        password: hashedPassword,
        role: invite.role,
        agency: invite.agency,
        emailVerified: true,
        isFirstLogin: true,
      },
    });

    await this.prisma.teamInvite.delete({ where: { token } });

    return { message: 'Conta criada com sucesso! Faça login para acessar a plataforma.' };
  }

  async removeMember(agentId: string, memberId: string) {
    if (agentId === memberId) {
      throw new ForbiddenException('Você não pode remover sua própria conta da equipe.');
    }

    const agent = await this.getAgent(agentId);
    const member = await this.getAgent(memberId);

    if (member.agency !== agent.agency) {
      throw new ForbiddenException('Este usuário não pertence à sua equipe.');
    }

    await this.prisma.user.update({
      where: { id: memberId },
      data: { isActive: false },
    });

    return { message: 'Membro removido da equipe.' };
  }

  async updateMemberRole(agentId: string, memberId: string, role: 'ADMIN' | 'AGENT') {
    if (agentId === memberId) {
      throw new ForbiddenException('Você não pode alterar sua própria função.');
    }

    const agent = await this.getAgent(agentId);
    const member = await this.getAgent(memberId);

    if (member.agency !== agent.agency) {
      throw new ForbiddenException('Este usuário não pertence à sua equipe.');
    }

    await this.prisma.user.update({
      where: { id: memberId },
      data: { role },
    });

    return { message: 'Função atualizada.' };
  }
}
