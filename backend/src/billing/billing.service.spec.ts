import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Mock global fetch ────────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeSub = (overrides: Record<string, any> = {}) => ({
  id:                  'sub-id-1',
  userId:              'user-id-1',
  plan:                'starter',
  status:              'PENDING',
  asaasCustomerId:     'cus_asaas_1',
  asaasSubscriptionId: 'sub_asaas_1',
  nextDueDate:         null,
  cancelledAt:         null,
  ...overrides,
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('BillingService', () => {
  let service: BillingService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update:     jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      findFirst:  jest.fn(),
      upsert:     jest.fn(),
      update:     jest.fn(),
    },
  };

  // Config padrão — sandbox com secret configurado
  const buildConfig = (overrides: Record<string, string> = {}) => ({
    get: jest.fn((key: string) => {
      const defaults: Record<string, string> = {
        ASAAS_API_KEY:        'test-api-key',
        ASAAS_WEBHOOK_SECRET: 'valid-webhook-secret',
        ASAAS_SANDBOX:        'true',
        ...overrides,
      };
      return defaults[key] ?? undefined;
    }),
  });

  const buildModule = async (configOverrides: Record<string, string> = {}) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: buildConfig(configOverrides) },
      ],
    }).compile();
    return module.get<BillingService>(BillingService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await buildModule();
  });

  // ─── handleWebhook — segurança ─────────────────────────────────────────────

  describe('handleWebhook — validação de token', () => {
    it('deve lançar UnauthorizedException se ASAAS_WEBHOOK_SECRET não está configurado', async () => {
      const serviceNoSecret = await buildModule({ ASAAS_WEBHOOK_SECRET: '' });

      await expect(
        serviceNoSecret.handleWebhook('qualquer-token', {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se o token não confere', async () => {
      await expect(
        service.handleWebhook('token-errado', {}),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.subscription.findFirst).not.toHaveBeenCalled();
    });

    it('deve aceitar requisição com token correto', async () => {
      const result = await service.handleWebhook('valid-webhook-secret', {
        event: 'EVENTO_DESCONHECIDO',
        payment: {},
      });
      expect(result).toEqual({ received: true });
    });

    it('deve retornar received:true para evento sem payment.subscription', async () => {
      const result = await service.handleWebhook('valid-webhook-secret', {
        event:   'PAYMENT_CONFIRMED',
        payment: { id: 'pay_1' }, // sem .subscription
      });

      expect(result).toEqual({ received: true });
      expect(mockPrisma.subscription.findFirst).not.toHaveBeenCalled();
    });
  });

  // ─── handleWebhook — PAYMENT_CONFIRMED ────────────────────────────────────

  describe('handleWebhook — PAYMENT_CONFIRMED', () => {
    const event = {
      event:   'PAYMENT_CONFIRMED',
      payment: { subscription: 'sub_asaas_1', dueDate: '2026-04-20' },
    };

    beforeEach(() => {
      mockPrisma.subscription.findFirst.mockResolvedValue(makeSub());
      mockPrisma.subscription.update.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({});
    });

    it('deve atualizar status da subscription para ACTIVE', async () => {
      await service.handleWebhook('valid-webhook-secret', event);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });

    it('deve atualizar o plano do usuário para o plano da subscription', async () => {
      await service.handleWebhook('valid-webhook-secret', event);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data:  { plan: 'starter' },
      });
    });

    it('deve salvar a próxima data de vencimento', async () => {
      await service.handleWebhook('valid-webhook-secret', event);

      const updateData = mockPrisma.subscription.update.mock.calls[0][0].data;
      expect(updateData.nextDueDate).toEqual(new Date('2026-04-20'));
    });

    it('deve funcionar igualmente para PAYMENT_RECEIVED', async () => {
      await service.handleWebhook('valid-webhook-secret', {
        ...event,
        event: 'PAYMENT_RECEIVED',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data:  { plan: 'starter' },
      });
    });

    it('não deve alterar usuário se subscription não for encontrada', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(null);

      await service.handleWebhook('valid-webhook-secret', event);

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  // ─── handleWebhook — PAYMENT_OVERDUE ──────────────────────────────────────

  describe('handleWebhook — PAYMENT_OVERDUE', () => {
    const event = {
      event:   'PAYMENT_OVERDUE',
      payment: { subscription: 'sub_asaas_1' },
    };

    it('deve marcar subscription como OVERDUE', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(makeSub());
      mockPrisma.subscription.update.mockResolvedValue({});

      await service.handleWebhook('valid-webhook-secret', event);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'OVERDUE' } }),
      );
    });

    it('NÃO deve alterar o plano do usuário em OVERDUE', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue(makeSub());
      mockPrisma.subscription.update.mockResolvedValue({});

      await service.handleWebhook('valid-webhook-secret', event);

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  // ─── handleWebhook — SUBSCRIPTION_INACTIVATED ─────────────────────────────

  describe('handleWebhook — SUBSCRIPTION_INACTIVATED', () => {
    const event = {
      event:   'SUBSCRIPTION_INACTIVATED',
      payment: { subscription: 'sub_asaas_1' },
    };

    beforeEach(() => {
      mockPrisma.subscription.findFirst.mockResolvedValue(makeSub({ plan: 'pro' }));
      mockPrisma.subscription.update.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({});
    });

    it('deve marcar subscription como INACTIVE', async () => {
      await service.handleWebhook('valid-webhook-secret', event);

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'INACTIVE' }),
        }),
      );
    });

    it('deve fazer downgrade do usuário para plano free', async () => {
      await service.handleWebhook('valid-webhook-secret', event);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data:  { plan: 'free' },
      });
    });

    it('deve salvar cancelledAt', async () => {
      const before = Date.now();
      await service.handleWebhook('valid-webhook-secret', event);

      const updateData = mockPrisma.subscription.update.mock.calls[0][0].data;
      expect(updateData.cancelledAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  // ─── createCheckout ────────────────────────────────────────────────────────

  describe('createCheckout', () => {
    it('deve lançar BadRequestException para planId inválido', async () => {
      await expect(
        service.createCheckout('user-id-1', 'plano-inexistente'),
      ).rejects.toThrow(BadRequestException);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para planId "free" (não tem valor)', async () => {
      await expect(
        service.createCheckout('user-id-1', 'free'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── cancelSubscription ────────────────────────────────────────────────────

  describe('cancelSubscription', () => {
    it('deve fazer downgrade para free mesmo sem subscription ativa', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.cancelSubscription('user-id-1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data:  { plan: 'free' },
      });
      expect(result.message).toContain('free');
    });

    it('deve cancelar subscription no Asaas e marcar como CANCELLED', async () => {
      const sub = makeSub({ status: 'ACTIVE' });
      mockPrisma.subscription.findUnique.mockResolvedValue(sub);
      mockPrisma.subscription.update.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({});

      // Mock do fetch para DELETE no Asaas
      mockFetch.mockResolvedValue({
        ok:   true,
        json: jest.fn().mockResolvedValue({ deleted: true }),
      });

      await service.cancelSubscription('user-id-1');

      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CANCELLED' }),
        }),
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data:  { plan: 'free' },
      });
    });

    it('deve continuar o downgrade mesmo se o cancelamento no Asaas falhar', async () => {
      const sub = makeSub({ status: 'ACTIVE' });
      mockPrisma.subscription.findUnique.mockResolvedValue(sub);
      mockPrisma.subscription.update.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({});

      // Simula falha na API do Asaas
      mockFetch.mockRejectedValue(new Error('Asaas offline'));

      await service.cancelSubscription('user-id-1');

      // Downgrade deve acontecer mesmo assim
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data:  { plan: 'free' },
      });
    });
  });
});
