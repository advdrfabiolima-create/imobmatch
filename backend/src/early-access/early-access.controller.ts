import {
  Controller, Post, Get, Delete, Body, Param, Query, Res,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EarlyAccessService } from './early-access.service';
import { CreateEarlyAccessLeadDto, BulkInviteDto } from './dto/early-access.dto';

// ── Público ───────────────────────────────────────────────────────────────────

@ApiTags('Acesso Antecipado')
@Controller('early-access')
export class EarlyAccessController {
  constructor(private readonly service: EarlyAccessService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Cadastrar interesse em acesso antecipado' })
  create(@Body() dto: CreateEarlyAccessLeadDto) {
    return this.service.create(dto);
  }

  @Get('count')
  @ApiOperation({ summary: 'Total de leads (público)' })
  count() {
    return this.service.count();
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  @Get('leads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: listar leads com filtros' })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
  ) {
    return this.service.findAll({
      status,
      search,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Post('leads/:id/invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: enviar convite para um lead' })
  invite(@Param('id') id: string) {
    return this.service.invite(id);
  }

  @Post('leads/bulk-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: enviar convites em massa' })
  inviteBulk(@Body() dto: BulkInviteDto) {
    return this.service.inviteBulk(dto.ids);
  }

  @Delete('leads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: excluir lead da lista' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('leads/export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: exportar leads em CSV' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.service.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads-imobmatch.csv"');
    res.send('\uFEFF' + csv); // BOM para Excel abrir corretamente com acentos
  }
}
