import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly from: string;
  private readonly fromName = 'ImobMatch';
  private readonly frontendUrl: string;

  constructor(private config: ConfigService) {
    this.apiKey     = config.get('BREVO_API_KEY') ?? '';
    this.from       = config.get('SMTP_FROM_EMAIL') ?? 'contato@useimobmatch.com.br';
    this.frontendUrl = config.get('FRONTEND_URL') ?? 'https://app.useimobmatch.com.br';
  }

  // ─── Verificação de e-mail ───────────────────────────────────────────────────

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verificar-email?token=${token}`;

    const content = `
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;font-weight:700;">Olá, ${name}!</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Obrigado por se cadastrar no <strong>ImobMatch</strong>!<br>
        Clique no botão abaixo para confirmar seu e-mail e ativar sua conta:
      </p>
      <a href="${verifyUrl}"
         style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        ✉️ Confirmar e-mail
      </a>
      <p style="color:#9ca3af;font-size:13px;margin:28px 0 0;line-height:1.6;">
        Este link expira em <strong>24 horas</strong>.<br>
        Se você não criou uma conta no ImobMatch, ignore este e-mail.
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:16px 0 0;word-break:break-all;">
        Link direto: ${verifyUrl}
      </p>
    `;

    await this.send(to, name, 'Confirme seu e-mail — ImobMatch', content);
  }

  // ─── Redefinição de senha ────────────────────────────────────────────────────

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const content = `
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;font-weight:700;">Olá, ${name}!</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Recebemos uma solicitação para redefinir a senha da sua conta.<br>
        Clique no botão abaixo para criar uma nova senha:
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        🔑 Redefinir minha senha
      </a>
      <p style="color:#9ca3af;font-size:13px;margin:28px 0 0;line-height:1.6;">
        Este link expira em <strong>1 hora</strong>.<br>
        Se você não solicitou a redefinição, ignore este e-mail.
      </p>
    `;

    await this.send(to, name, 'Redefinição de senha — ImobMatch', content);
  }

  // ─── Solicitação de parceria ─────────────────────────────────────────────────

  async sendPartnershipRequestEmail(
    to: string,
    receiverName: string,
    requesterName: string,
    requesterPhone: string | null,
    propertyTitle: string,
    propertyCity: string | null,
  ): Promise<void> {
    const dashboardUrl = `${this.frontendUrl}/parcerias`;

    const content = `
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;font-weight:700;">Olá, ${receiverName}!</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Você recebeu uma <strong>solicitação de parceria</strong> no ImobMatch e ela precisa da sua atenção.
      </p>

      <div style="background:#f0f9ff;border-left:4px solid #2563eb;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#1e40af;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Solicitação recebida de</p>
        <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${requesterName}</p>
        ${requesterPhone ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">📞 ${requesterPhone}</p>` : ''}
      </div>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Imóvel em questão</p>
        <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${propertyTitle}</p>
        ${propertyCity ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">📍 ${propertyCity}</p>` : ''}
      </div>

      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Acesse sua conta agora para <strong>aceitar ou recusar</strong> esta parceria.
        Solicitações sem resposta ficam pendentes e podem representar uma oportunidade perdida.
      </p>

      <a href="${dashboardUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        🤝 Ver solicitação de parceria
      </a>

      <p style="color:#9ca3af;font-size:13px;margin:28px 0 0;line-height:1.6;">
        Responda o quanto antes — parcerias bem respondidas constroem sua reputação na rede ImobMatch.
      </p>
    `;

    await this.send(
      to,
      receiverName,
      `🤝 ${requesterName} quer fazer parceria com você — ImobMatch`,
      content,
    );
  }

  // ─── Negócio fechado ────────────────────────────────────────────────────────

  async sendDealClosedEmail(
    to: string,
    recipientName: string,
    partnerName: string,
    propertyTitle: string,
    commissionSplit: number | null,
  ): Promise<void> {
    const dashboardUrl = `${this.frontendUrl}/parcerias`;

    const content = `
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;font-weight:700;">Parabéns, ${recipientName}! 🎉</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 20px;">
        O negócio em parceria com <strong>${partnerName}</strong> foi <strong>fechado com sucesso</strong> no ImobMatch!
      </p>

      <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;color:#15803d;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Imóvel negociado</p>
        <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${propertyTitle}</p>
        ${commissionSplit ? `<p style="margin:6px 0 0;color:#6b7280;font-size:13px;">Divisão de comissão acordada: <strong>${commissionSplit}%</strong></p>` : ''}
      </div>

      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Você ganhou <strong>+50 pontos</strong> no ranking ImobMatch. Continue fechando negócios em rede e suba ainda mais!
      </p>

      <a href="${dashboardUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        💰 Ver minhas parcerias
      </a>
    `;

    await this.send(to, recipientName, `💰 Negócio fechado com ${partnerName} — ImobMatch`, content);
  }

  // ─── Convite de membro de equipe ────────────────────────────────────────────

  async sendTeamInviteEmail(
    to: string,
    inviterName: string,
    agencyName: string,
    role: 'ADMIN' | 'AGENT',
  ): Promise<void> {
    const registerUrl = `${this.frontendUrl}/register?email=${encodeURIComponent(to)}&agency=${encodeURIComponent(agencyName)}&role=${role}`;
    const roleLabel = role === 'ADMIN' ? 'Administrador' : 'Corretor';

    const content = `
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;font-weight:700;">Você foi convidado para uma equipe!</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 20px;">
        <strong>${inviterName}</strong> convidou você para integrar a equipe
        <strong>${agencyName}</strong> no ImobMatch como <strong>${roleLabel}</strong>.
      </p>

      <div style="background:#f0f9ff;border-left:4px solid #2563eb;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;color:#1e40af;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Equipe</p>
        <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${agencyName}</p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Função: ${roleLabel}</p>
      </div>

      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Crie sua conta no ImobMatch com este e-mail para aceitar o convite e começar a trabalhar em equipe.
      </p>

      <a href="${registerUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        🚀 Aceitar convite e criar conta
      </a>

      <p style="color:#9ca3af;font-size:13px;margin:28px 0 0;line-height:1.6;">
        Se você não esperava este convite, pode ignorar este e-mail com segurança.
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:16px 0 0;word-break:break-all;">
        Link direto: ${registerUrl}
      </p>
    `;

    await this.send(to, to, `🏢 ${inviterName} convidou você para a equipe ${agencyName} — ImobMatch`, content);
  }

  // ─── Convite de acesso antecipado ───────────────────────────────────────────

  async sendEarlyAccessInvite(to: string, name: string): Promise<void> {
    const registerUrl = `${this.frontendUrl}/register?email=${encodeURIComponent(to)}`;

    const content = `
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;font-weight:700;">Olá, ${name}! 🎉</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 8px;">
        Boa notícia! Sua vaga de acesso antecipado ao <strong>ImobMatch</strong> foi liberada.
      </p>
      <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
        O ImobMatch é uma plataforma para corretores encontrarem imóveis, compradores
        e parcerias com mais facilidade. Clique no botão abaixo para criar sua conta e começar:
      </p>
      <a href="${registerUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
        🚀 Acessar minha conta
      </a>
      <p style="color:#9ca3af;font-size:13px;margin:28px 0 0;line-height:1.6;">
        Se você não se inscreveu na lista de acesso antecipado, ignore este e-mail.
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:16px 0 0;word-break:break-all;">
        Link direto: ${registerUrl}
      </p>
    `;

    await this.send(to, name, '🎉 Sua vaga no ImobMatch foi liberada!', content);
  }

  // ─── Envio via Brevo HTTP API ────────────────────────────────────────────────

  private async send(to: string, toName: string, subject: string, content: string): Promise<void> {
    const year = new Date().getFullYear();

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.07);">
          <div style="background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%);padding:24px 40px;text-align:center;">
            <img src="${this.frontendUrl}/logo.png" alt="ImobMatch" width="160" style="height:auto;display:block;margin:0 auto;" />
          </div>
          <div style="padding:36px 40px;">${content}</div>
          <div style="background:#f9fafb;padding:18px 40px;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
              © ${year} ImobMatch · useimobmatch.com.br<br>
              Dúvidas? <a href="mailto:contato@useimobmatch.com.br" style="color:#6b7280;">contato@useimobmatch.com.br</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept':       'application/json',
          'api-key':      this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender:      { name: this.fromName, email: this.from },
          to:          [{ email: to, name: toName }],
          subject,
          htmlContent: html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Brevo API ${response.status}: ${error}`);
      }

      this.logger.log(`Email sent to ${to} — "${subject}"`);
    } catch (err) {
      this.logger.warn(`Failed to send email to ${to}: ${err.message}`);
    }
  }
}
