import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TeamService } from './team.service';

@ApiTags('Equipe')
@Controller('team/invite')
export class TeamInvitePublicController {
  constructor(private readonly teamService: TeamService) {}

  @Get('accept/:token')
  @ApiOperation({ summary: 'Obter dados do convite pelo token' })
  getInvite(@Param('token') token: string) {
    return this.teamService.getInviteByToken(token);
  }

  @Post('accept/:token')
  @ApiOperation({ summary: 'Aceitar convite e criar conta' })
  acceptInvite(
    @Param('token') token: string,
    @Body() body: { name: string; password: string },
  ) {
    return this.teamService.acceptInvite(token, body.name, body.password);
  }
}
