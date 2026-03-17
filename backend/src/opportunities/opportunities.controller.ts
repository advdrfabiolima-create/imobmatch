import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Oportunidades')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cadastrar oportunidade urgente' })
  create(@Request() req, @Body() dto: any) {
    return this.opportunitiesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar oportunidades com filtros' })
  findAll(@Query() query: any) {
    return this.opportunitiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar oportunidade' })
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remover oportunidade' })
  remove(@Param('id') id: string, @Request() req) {
    return this.opportunitiesService.remove(id, req.user.id);
  }
}
