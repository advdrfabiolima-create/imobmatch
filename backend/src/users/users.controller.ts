import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Buscar corretores' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas do painel do corretor' })
  getDashboard(@Request() req) {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver perfil de um corretor' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload de foto/logomarca do corretor' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new BadRequestException('Apenas imagens'), false);
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const avatarUrl = await this.storageService.uploadFile(file, 'avatars');
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }

  @Post('ping')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status online' })
  ping(@Request() req) {
    return this.usersService.ping(req.user.id);
  }

  @Patch('onboarding/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar onboarding como concluído' })
  completeOnboarding(@Request() req) {
    return this.usersService.completeOnboarding(req.user.id);
  }

  @Patch('plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar plano do usuário' })
  changePlan(@Request() req, @Body() body: { plan: 'starter' | 'professional' | 'agency' }) {
    return this.usersService.changePlan(req.user.id, body.plan);
  }
}
