import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamService } from './team.service';

@ApiTags('Equipe')
@Controller('team')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  @ApiOperation({ summary: 'Listar membros da equipe' })
  getMembers(@Request() req) {
    return this.teamService.getMembers(req.user.id);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Convidar membro para a equipe' })
  inviteMember(@Request() req, @Body() body: { email: string; role: 'ADMIN' | 'AGENT' }) {
    return this.teamService.inviteMember(req.user.id, body.email, body.role);
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Remover membro da equipe' })
  removeMember(@Request() req, @Param('id') id: string) {
    return this.teamService.removeMember(req.user.id, id);
  }

  @Patch('members/:id/role')
  @ApiOperation({ summary: 'Atualizar função de membro' })
  updateRole(@Request() req, @Param('id') id: string, @Body() body: { role: 'ADMIN' | 'AGENT' }) {
    return this.teamService.updateMemberRole(req.user.id, id, body.role);
  }
}
