import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { EarlyAccessService } from './early-access.service';
import { CreateEarlyAccessLeadDto } from './dto/early-access.dto';

@ApiTags('Acesso Antecipado')
@Controller('early-access')
export class EarlyAccessController {
  constructor(private readonly earlyAccessService: EarlyAccessService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Cadastrar interesse em acesso antecipado' })
  create(@Body() dto: CreateEarlyAccessLeadDto) {
    return this.earlyAccessService.create(dto);
  }

  @Get('count')
  @ApiOperation({ summary: 'Total de leads cadastrados (público)' })
  count() {
    return this.earlyAccessService.count();
  }
}
