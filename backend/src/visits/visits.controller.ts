import { Controller, Post, Get, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { VisitsService } from './visits.service';

@ApiTags('Visitas')
@Controller('visits')
export class VisitsController {
  constructor(private readonly service: VisitsService) {}

  @Post('track')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Registra visita única por IP e retorna total' })
  async track(
    @Req() req: Request,
    @Query('page') page?: string,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const uniqueVisitors = await this.service.trackAndCount(ip, page ?? 'lista-vip');
    return { uniqueVisitors };
  }

  @Get('count')
  @ApiOperation({ summary: 'Total de visitantes únicos (público)' })
  async count(@Query('page') page?: string) {
    const uniqueVisitors = await this.service.count(page ?? 'lista-vip');
    return { uniqueVisitors };
  }
}
