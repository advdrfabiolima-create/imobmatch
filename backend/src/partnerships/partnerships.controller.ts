import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartnershipsService } from './partnerships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Parcerias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('partnerships')
export class PartnershipsController {
  constructor(private readonly partnershipsService: PartnershipsService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar parceria em um imóvel' })
  request(@Request() req, @Body() dto: { propertyId: string; receiverId: string; commissionSplit?: number; message?: string }) {
    return this.partnershipsService.request(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar minhas parcerias' })
  findAll(@Request() req, @Query() query: any) {
    return this.partnershipsService.findAll(req.user.id, query);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Aceitar ou rejeitar parceria' })
  respond(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: 'ACCEPTED' | 'REJECTED'; commissionSplit?: number },
  ) {
    return this.partnershipsService.respond(id, req.user.id, body.status, body.commissionSplit);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar solicitação de parceria' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.partnershipsService.cancel(id, req.user.id);
  }
}
