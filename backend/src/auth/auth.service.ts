import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { normalizePlan } from '../common/plans.config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );

    const rawRefreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    // Limpa tokens expirados do usuário (housekeeping silencioso)
    this.prisma.refreshToken
      .deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
      .catch(() => {});

    await this.prisma.refreshToken.create({
      data: { token: this.hashToken(rawRefreshToken), userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  // ─── refresh ───────────────────────────────────────────────────────────────

  async refresh(rawToken: string) {
    const hashed = this.hashToken(rawToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hashed },
      include: { user: true },
    });

    // Token reutilizado após revogação → possível roubo → invalida toda a família
    if (stored?.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Sessão inválida. Faça login novamente.');
    }

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    // Revoga o token usado (rotação)
    await this.prisma.refreshToken.update({
      where: { token: hashed },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens({
      id: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    });
  }

  // ─── revokeRefreshToken ────────────────────────────────────────────────────

  async revokeRefreshToken(rawToken: string) {
    const hashed = this.hashToken(rawToken);
    await this.prisma.refreshToken
      .updateMany({ where: { token: hashed, revokedAt: null }, data: { revokedAt: new Date() } })
      .catch(() => {});
  }

  // ─── verifyEmail ───────────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) throw new BadRequestException('Token de verificação inválido ou expirado');

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new BadRequestException('Link de verificação expirado. Solicite um novo.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'E-mail verificado com sucesso!' };
  }

  // ─── register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = uuidv4();
    const verificationExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
      select: {
        id: true, name: true, email: true, phone: true,
        city: true, state: true, agency: true, creci: true,
        role: true, plan: true, isLifetime: true, isFirstLogin: true, emailVerified: true, createdAt: true,
      },
    });

    this.mailService.sendVerificationEmail(user.email, user.name, verificationToken);

    this.prisma.earlyAccessLead.updateMany({
      where: { email: dto.email, status: { not: 'REGISTERED' } },
      data: { status: 'REGISTERED' },
    }).catch(() => {});

    const tokens = await this.generateTokens({ id: user.id, email: user.email, role: user.role });
    return { user, ...tokens };
  }

  // ─── login ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const { password, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens({ id: user.id, email: user.email, role: user.role });
    return { user: { ...userWithoutPassword, plan: normalizePlan(user.plan) }, ...tokens };
  }

  // ─── forgotPassword ────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { message: 'Se o e-mail existir, você receberá as instruções.' };

    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000); // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    this.mailService.sendPasswordResetEmail(user.email, user.name, token);
    return { message: 'Se o e-mail existir, você receberá as instruções.' };
  }

  // ─── resetPassword ─────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Token inválido ou expirado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  // ─── changePassword ────────────────────────────────────────────────────────

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Senha atual incorreta');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso!' };
  }

  // ─── resendVerification ────────────────────────────────────────────────────

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.emailVerified) return { message: 'E-mail já verificado.' };

    const token = uuidv4();
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: token, emailVerificationExpiry: expiry },
    });

    this.mailService.sendVerificationEmail(user.email, user.name, token);
    return { message: 'E-mail de verificação reenviado!' };
  }

  // ─── getMe ─────────────────────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true, city: true,
        state: true, agency: true, creci: true, bio: true, avatarUrl: true,
        role: true, plan: true, isLifetime: true, isFirstLogin: true, emailVerified: true, createdAt: true,
        cpfCnpj: true, personType: true,
        _count: { select: { properties: true, buyers: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return { ...user, plan: normalizePlan(user.plan) };
  }
}
