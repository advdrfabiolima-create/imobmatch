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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken: verificationToken,
      },
      select: {
        id: true, name: true, email: true, phone: true,
        city: true, state: true, agency: true, creci: true,
        role: true, plan: true, isLifetime: true, isFirstLogin: true, emailVerified: true, createdAt: true,
      },
    });

    // Send verification email (fire-and-forget; won't block registration)
    this.mailService.sendVerificationEmail(user.email, user.name, verificationToken);

    // Se o e-mail estava na lista de acesso antecipado, marca como REGISTERED
    this.prisma.earlyAccessLead.updateMany({
      where: { email: dto.email, status: { not: 'REGISTERED' } },
      data: { status: 'REGISTERED' },
    }).catch(() => {});

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { user, token };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
    if (!user) throw new BadRequestException('Token de verificação inválido ou expirado');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });

    return { message: 'E-mail verificado com sucesso!' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const { password, ...userWithoutPassword } = user;
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: { ...userWithoutPassword, plan: normalizePlan(user.plan) }, token };
  }

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

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (user.emailVerified) return { message: 'E-mail já verificado.' };

    const token = uuidv4();
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: token },
    });

    this.mailService.sendVerificationEmail(user.email, user.name, token);
    return { message: 'E-mail de verificação reenviado!' };
  }

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
