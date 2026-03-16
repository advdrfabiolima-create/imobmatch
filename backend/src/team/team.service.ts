import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  private async getAgent(agentId: string) {
    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Usuário não encontrado');
    return agent;
  }

  async getMembers(agentId: string) {
    const agent = await this.getAgent(agentId);

    // Members = users with the same agency, or just the agent themselves if no agency
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
      // If they exist and have the same agency, just return success
      if (existing.agency === agent.agency) {
        return { message: 'Usuário já faz parte da equipe.' };
      }
      // Update their agency to match
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { agency: agent.agency ?? undefined, role },
      });
      return { message: `${existing.name} adicionado(a) à equipe!` };
    }

    // User doesn't exist — return instructions (real invite email would go here)
    return {
      message: `Convite registrado para ${email}. Peça para o usuário criar uma conta com este e-mail na plataforma.`,
      invited: true,
      email,
    };
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

    // Deactivate member
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
