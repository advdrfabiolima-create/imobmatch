import { Controller, Post, Body, Get, Query, UseGuards, Request, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const ACCESS_COOKIE  = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_MAX_AGE  = 15 * 60 * 1000;           // 15 minutos em ms
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;  // 7 dias em ms

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.cookie(ACCESS_COOKIE,  accessToken,  { ...base, maxAge: ACCESS_MAX_AGE  });
    res.cookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: REFRESH_MAX_AGE });
  }

  private clearAuthCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.clearCookie(ACCESS_COOKIE,  base);
    res.clearCookie(REFRESH_COOKIE, base);
  }

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar tokens usando refresh token' })
  async refresh(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (!rawToken) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Refresh token ausente');
    }
    const { accessToken, refreshToken } = await this.authService.refresh(rawToken);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { message: 'Tokens renovados' };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Fazer logout' })
  async logout(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (rawToken) await this.authService.revokeRefreshToken(rawToken);
    this.clearAuthCookies(res);
    return { message: 'Logout realizado com sucesso' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar redefinição de senha' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verificar e-mail com token' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reenviar e-mail de verificação' })
  resendVerification(@Request() req) {
    return this.authService.resendVerification(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }
}
