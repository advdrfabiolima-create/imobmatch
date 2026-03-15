import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { PropertyImportService } from './property-import.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { ImportPropertyDto } from './dto/import-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Imóveis')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly propertyImportService: PropertyImportService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar novo imóvel' })
  create(@Request() req, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(req.user.id, dto);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Importar dados de imóvel por URL (não salva no banco)' })
  importFromUrl(@Body() dto: ImportPropertyDto) {
    return this.propertyImportService.importFromUrl(dto.url);
  }

  @Get()
  @ApiOperation({ summary: 'Listar imóveis disponíveis' })
  findAll(@Query() query: any) {
    return this.propertiesService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Meus imóveis' })
  getMyProperties(@Request() req, @Query() query: any) {
    return this.propertiesService.getMyProperties(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalhes de um imóvel' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar imóvel' })
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, req.user.id, dto, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir imóvel' })
  remove(@Param('id') id: string, @Request() req) {
    return this.propertiesService.remove(id, req.user.id, req.user.role);
  }
}
