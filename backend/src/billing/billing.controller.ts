import {
  Controller, Post, Get, Delete,
  Body, Headers, Request, UseGuards, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /** Cria checkout e retorna URL de pagamento Asaas */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar link de pagamento para um plano' })
  createCheckout(@Request() req, @Body() body: { planId: string }) {
    return this.billingService.createCheckout(req.user.id, body.planId);
  }

  /** Consulta assinatura ativa do usuário */
  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar assinatura atual' })
  getSubscription(@Request() req) {
    return this.billingService.getSubscription(req.user.id);
  }

  /** Cancela assinatura e faz downgrade para free */
  @Delete('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar assinatura' })
  cancelSubscription(@Request() req) {
    return this.billingService.cancelSubscription(req.user.id);
  }

  /** Recebe eventos do Asaas via webhook */
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook Asaas (chamado pela Asaas)' })
  webhook(
    @Headers('asaas-access-token') token: string,
    @Body() body: any,
  ) {
    return this.billingService.handleWebhook(token ?? '', body);
  }
}
