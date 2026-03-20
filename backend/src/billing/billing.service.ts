import { Injectable, Logger, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

const PLAN_VALUES: Record<string, number> = {
  starter: 39,
  pro: 79,
  premium: 149,
  agency: 399,
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly webhookSecret: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey        = config.get('ASAAS_API_KEY') ?? '';
    this.webhookSecret = config.get('ASAAS_WEBHOOK_SECRET') ?? '';
    const sandbox      = config.get('ASAAS_SANDBOX') !== 'false';
    this.baseUrl       = sandbox
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://api.asaas.com/v3';
  }

  // ─── Asaas HTTP helper ──────────────────────────────────────────────────────

  private async request<T = any>(method: string, path: string, body?: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'accept':       'application/json',
        'content-type': 'application/json',
        'access_token': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json() as any;

    if (!res.ok) {
      const msg = data?.errors?.[0]?.description ?? 'Erro ao processar pagamento';
      this.logger.error(`Asaas ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
      throw new BadRequestException(msg);
    }

    return data;
  }

  // ─── Customer ────────────────────────────────────────────────────────────────

  async createOrFindCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, asaasCustomerId: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.asaasCustomerId) return user.asaasCustomerId;

    // Busca cliente existente por e-mail
    const search = await this.request<any>('GET', `/customers?email=${encodeURIComponent(user.email)}`);
    if (search.data?.length > 0) {
      const customerId = search.data[0].id as string;
      await this.prisma.user.update({ where: { id: userId }, data: { asaasCustomerId: customerId } });
      return customerId;
    }

    // Cria novo cliente
    const customer = await this.request<any>('POST', '/customers', {
      name:  user.name,
      email: user.email,
    });

    await this.prisma.user.update({ where: { id: userId }, data: { asaasCustomerId: customer.id } });
    return customer.id as string;
  }

  // ─── Checkout ────────────────────────────────────────────────────────────────

  async createCheckout(userId: string, planId: string): Promise<{ paymentUrl: string }> {
    const value = PLAN_VALUES[planId];
    if (!value) throw new BadRequestException('Plano inválido');

    const customerId = await this.createOrFindCustomer(userId);

    // Cancela assinatura anterior, se houver
    const existing = await this.prisma.subscription.findUnique({ where: { userId } });
    if (existing?.asaasSubscriptionId) {
      try {
        await this.request('DELETE', `/subscriptions/${existing.asaasSubscriptionId}`);
      } catch (err) {
        this.logger.warn(`Não foi possível cancelar assinatura anterior: ${err.message}`);
      }
    }

    const nextDueDate = new Date().toISOString().split('T')[0];
    const planLabel   = planId.charAt(0).toUpperCase() + planId.slice(1);

    // Cria assinatura no Asaas
    const subscription = await this.request<any>('POST', '/subscriptions', {
      customer:    customerId,
      billingType: 'UNDEFINED', // cliente escolhe PIX, boleto ou cartão
      value,
      nextDueDate,
      cycle:       'MONTHLY',
      description: `Plano ${planLabel} - ImobMatch`,
    });

    // Salva/atualiza assinatura local como PENDING
    await this.prisma.subscription.upsert({
      where:  { userId },
      create: {
        userId,
        asaasCustomerId:     customerId,
        asaasSubscriptionId: subscription.id,
        plan:                planId,
        status:              'PENDING',
      },
      update: {
        asaasCustomerId:     customerId,
        asaasSubscriptionId: subscription.id,
        plan:                planId,
        status:              'PENDING',
        cancelledAt:         null,
      },
    });

    // Busca URL da primeira cobrança gerada
    const payments = await this.request<any>('GET', `/payments?subscription=${subscription.id}`);
    const firstPayment = payments.data?.[0];

    if (!firstPayment?.invoiceUrl) {
      throw new BadRequestException('Não foi possível obter o link de pagamento. Tente novamente.');
    }

    this.logger.log(`Checkout criado: user=${userId} plan=${planId} payment=${firstPayment.id}`);
    return { paymentUrl: firstPayment.invoiceUrl as string };
  }

  // ─── Consultar assinatura ────────────────────────────────────────────────────

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  // ─── Cancelar assinatura ─────────────────────────────────────────────────────

  async cancelSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });

    if (sub?.asaasSubscriptionId) {
      try {
        await this.request('DELETE', `/subscriptions/${sub.asaasSubscriptionId}`);
      } catch (err) {
        this.logger.warn(`Erro ao cancelar no Asaas: ${err.message}`);
      }

      await this.prisma.subscription.update({
        where: { userId },
        data:  { status: 'CANCELLED', cancelledAt: new Date() },
      });
    }

    await this.prisma.user.update({ where: { id: userId }, data: { plan: 'free' } });
    this.logger.log(`Assinatura cancelada: user=${userId}`);
    return { message: 'Assinatura cancelada. Seu plano foi alterado para free.' };
  }

  // ─── Webhook Asaas ──────────────────────────────────────────────────────────

  async handleWebhook(secret: string, event: any): Promise<{ received: boolean }> {
    if (!this.webhookSecret) {
      this.logger.error('ASAAS_WEBHOOK_SECRET não configurado — webhook bloqueado por segurança');
      throw new UnauthorizedException('Webhook não autorizado');
    }
    if (secret !== this.webhookSecret) {
      this.logger.warn('Webhook recebido com token inválido');
      throw new UnauthorizedException('Webhook não autorizado');
    }

    const eventType = event?.event as string;
    const payment   = event?.payment;

    this.logger.log(`Asaas webhook: ${eventType}`);

    if (!payment?.subscription) return { received: true };

    const subscriptionId = payment.subscription as string;

    // ── Pagamento confirmado → ativa plano ──────────────────────────────────
    if (eventType === 'PAYMENT_CONFIRMED' || eventType === 'PAYMENT_RECEIVED') {
      const sub = await this.prisma.subscription.findFirst({
        where: { asaasSubscriptionId: subscriptionId },
      });
      if (sub) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data:  {
            status:      'ACTIVE',
            nextDueDate: payment.dueDate ? new Date(payment.dueDate) : undefined,
          },
        });
        await this.prisma.user.update({
          where: { id: sub.userId },
          data:  { plan: sub.plan },
        });
        this.logger.log(`Plano ativado: user=${sub.userId} → ${sub.plan}`);
      }
    }

    // ── Pagamento vencido → marca overdue (mantém plano ativo por hora) ─────
    if (eventType === 'PAYMENT_OVERDUE') {
      const sub = await this.prisma.subscription.findFirst({
        where: { asaasSubscriptionId: subscriptionId },
      });
      if (sub) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data:  { status: 'OVERDUE' },
        });
        this.logger.log(`Pagamento vencido: user=${sub.userId}`);
      }
    }

    // ── Assinatura inativada → downgrade para free ───────────────────────────
    if (eventType === 'SUBSCRIPTION_INACTIVATED') {
      const sub = await this.prisma.subscription.findFirst({
        where: { asaasSubscriptionId: subscriptionId },
      });
      if (sub) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data:  { status: 'INACTIVE', cancelledAt: new Date() },
        });
        await this.prisma.user.update({
          where: { id: sub.userId },
          data:  { plan: 'free' },
        });
        this.logger.log(`Assinatura inativada, plano → free: user=${sub.userId}`);
      }
    }

    return { received: true };
  }
}
