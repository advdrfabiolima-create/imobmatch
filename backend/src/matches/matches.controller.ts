import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Gerar matches para meus compradores' })
  generate(@Request() req) {
    return this.matchesService.generateMatches(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os meus matches' })
  findAll(@Request() req, @Query() query: any) {
    return this.matchesService.getMyMatches(req.user.id, query);
  }

  @Get('best')
  @ApiOperation({ summary: 'Melhores matches (score >= 70)' })
  getBest(@Request() req) {
    return this.matchesService.getBestMatches(req.user.id);
  }

  @Get('buyer/:buyerId')
  @ApiOperation({ summary: 'Matches de um comprador específico' })
  getForBuyer(@Param('buyerId') buyerId: string, @Request() req) {
    return this.matchesService.getMatchesForBuyer(buyerId, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do match' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
    return this.matchesService.updateMatchStatus(id, status, req.user.id);
  }
}
