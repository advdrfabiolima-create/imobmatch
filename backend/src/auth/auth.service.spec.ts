import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

// ─── Mocks de módulos externos ──────────────────────────────────────────────

jest.mock('bcrypt', () => ({
  hash:    jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-token'),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeUser = (overrides: Record<string, any> = {}) => ({
  id:            'user-id-1',
  name:          'João Silva',
  email:         'joao@test.com',
  password:      'hashed_password',
  role:          'AGENT',
  plan:          'free',
  isLifetime:    false,
  isFirstLogin:  true,
  isActive:      true,
  emailVerified: false,
  createdAt:     new Date(),
  resetToken:           null,
  resetTokenExpiry:     null,
  emailVerificationToken:  null,
  emailVerificationExpiry: null,
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst:  jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
    },
    earlyAccessLead: {
      updateMany: jest.fn(),
    },
    refreshToken: {
      create:     jest.fn(),
      findUnique: jest.fn(),
      update:     jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwt   = { sign: jest.fn().mockReturnValue('mock-jwt-token') };
  const mockMail  = {
    sendVerificationEmail:  jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService,    useValue: mockJwt   },
        { provide: MailService,   useValue: mockMail  },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();

    // Defaults após clearAllMocks
    mockJwt.sign.mockReturnValue('mock-jwt-token');
    (bcrypt.hash    as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    mockPrisma.earlyAccessLead.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.refreshToken.create.mockResolvedValue({});
    mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
  });

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = { name: 'João Silva', email: 'joao@test.com', password: 'senha123' };

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(makeUser());
    });

    it('deve criar conta e retornar { user, accessToken, refreshToken }', async () => {
      const result = await service.register(dto as any);

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(dto.email);
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('deve fazer hash da senha antes de salvar', async () => {
      await service.register(dto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      const createData = mockPrisma.user.create.mock.calls[0][0].data;
      expect(createData.password).toBe('hashed_password');
    });

    it('deve salvar o token de verificação de e-mail', async () => {
      await service.register(dto as any);

      const createData = mockPrisma.user.create.mock.calls[0][0].data;
      expect(createData.emailVerificationToken).toBe('mock-uuid-token');
    });

    it('deve definir expiração de ~48h no token de verificação', async () => {
      const before = Date.now();
      await service.register(dto as any);
      const after = Date.now();

      const createData = mockPrisma.user.create.mock.calls[0][0].data;
      const expiry: Date = createData.emailVerificationExpiry;

      expect(expiry.getTime()).toBeGreaterThanOrEqual(before + 47 * 3600 * 1000);
      expect(expiry.getTime()).toBeLessThanOrEqual(after  + 49 * 3600 * 1000);
    });

    it('deve enviar e-mail de verificação (fire-and-forget)', async () => {
      await service.register(dto as any);

      expect(mockMail.sendVerificationEmail).toHaveBeenCalledWith(
        dto.email, dto.name, 'mock-uuid-token',
      );
    });

    it('deve lançar ConflictException se e-mail já está cadastrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(service.register(dto as any)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'joao@test.com', password: 'senha123' };

    it('deve retornar { user, accessToken, refreshToken } com credenciais válidas', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { sub: 'user-id-1', email: dto.email, role: 'AGENT' },
        { expiresIn: '15m' },
      );
    });

    it('não deve expor a senha no objeto retornado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('deve lançar UnauthorizedException se senha incorreta', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se conta está inativa', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser({ isActive: false }));

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── verifyEmail ───────────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('deve verificar e-mail e limpar o token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(
        makeUser({ emailVerificationExpiry: new Date(Date.now() + 3600_000) }),
      );
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBe('E-mail verificado com sucesso!');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: {
          emailVerified:              true,
          emailVerificationToken:     null,
          emailVerificationExpiry:    null,
        },
      });
    });

    it('deve lançar BadRequestException para token inválido', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('token-invalido')).rejects.toThrow(BadRequestException);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se token expirou', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(
        makeUser({ emailVerificationExpiry: new Date(Date.now() - 1000) }), // expirado há 1s
      );

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(BadRequestException);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  // ─── forgotPassword ────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('deve retornar mensagem genérica quando e-mail não existe (anti-enumeração)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'nao@existe.com' });

      expect(result.message).toContain('Se o e-mail existir');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockMail.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('deve gerar token, salvar expiração de 1h e enviar e-mail', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      mockPrisma.user.update.mockResolvedValue({});

      const before = Date.now();
      await service.forgotPassword({ email: 'joao@test.com' });

      const updateData = mockPrisma.user.update.mock.calls[0][0].data;
      expect(updateData.resetToken).toBe('mock-uuid-token');
      expect(updateData.resetTokenExpiry.getTime()).toBeGreaterThanOrEqual(before + 3590_000);
      expect(mockMail.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  // ─── resetPassword ─────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('deve redefinir a senha e limpar o token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(makeUser());
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.resetPassword({ token: 'valid-token', password: 'nova_senha' });

      expect(result.message).toBe('Senha redefinida com sucesso');
      expect(bcrypt.hash).toHaveBeenCalledWith('nova_senha', 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data:  { password: 'hashed_password', resetToken: null, resetTokenExpiry: null },
      });
    });

    it('deve lançar BadRequestException para token inválido ou expirado', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'expirado', password: 'senha' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── resendVerification ────────────────────────────────────────────────────

  describe('resendVerification', () => {
    it('deve gerar novo token com expiração de ~48h e reenviar e-mail', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser({ emailVerified: false }));
      mockPrisma.user.update.mockResolvedValue({});

      const before = Date.now();
      await service.resendVerification('user-id-1');

      const updateData = mockPrisma.user.update.mock.calls[0][0].data;
      expect(updateData.emailVerificationToken).toBe('mock-uuid-token');
      expect(updateData.emailVerificationExpiry.getTime()).toBeGreaterThanOrEqual(before + 47 * 3600_000);
      expect(mockMail.sendVerificationEmail).toHaveBeenCalled();
    });

    it('deve retornar mensagem de já verificado sem reenviar', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser({ emailVerified: true }));

      const result = await service.resendVerification('user-id-1');

      expect(result.message).toContain('já verificado');
      expect(mockMail.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resendVerification('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
