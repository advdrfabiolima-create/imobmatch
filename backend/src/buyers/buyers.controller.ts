import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Compradores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar comprador' })
  create(@Request() req, @Body() dto: CreateBuyerDto) {
    return this.buyersService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar meus compradores' })
  findAll(@Request() req, @Query() query: any) {
    return this.buyersService.findAll(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalhes de um comprador' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.buyersService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar comprador' })
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateBuyerDto) {
    return this.buyersService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover comprador' })
  remove(@Param('id') id: string, @Request() req) {
    return this.buyersService.remove(id, req.user.id);
  }
}
