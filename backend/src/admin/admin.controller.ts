import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas gerais da plataforma' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  listUsers(@Query() query: any) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/toggle')
  @ApiOperation({ summary: 'Ativar/desativar usuário' })
  toggleUser(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Deletar usuário e todos os seus dados' })
  removeUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }

  @Get('properties')
  @ApiOperation({ summary: 'Listar todos os imóveis' })
  listProperties(@Query() query: any) {
    return this.adminService.listProperties(query);
  }

  @Delete('properties/:id')
  @ApiOperation({ summary: 'Remover imóvel abusivo' })
  removeProperty(@Param('id') id: string) {
    return this.adminService.removeProperty(id);
  }

  @Get('opportunities')
  @ApiOperation({ summary: 'Listar todas as oportunidades' })
  listOpportunities(@Query() query: any) {
    return this.adminService.listOpportunities(query);
  }

  @Delete('opportunities/:id')
  @ApiOperation({ summary: 'Remover oportunidade abusiva' })
  removeOpportunity(@Param('id') id: string) {
    return this.adminService.removeOpportunity(id);
  }
}
