import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private config: ConfigService) {
    this.from = config.get('SMTP_FROM') ?? '"ImobMatch" <contato@useimobmatch.com.br>';
    this.frontendUrl = config.get('FRONTEND_URL') ?? 'https://app.useimobmatch.com.br';

    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: Number(config.get('SMTP_PORT') || 587),
      secure: config.get('SMTP_SECURE') === 'true',
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  // ─── Layout base ────────────────────────────────────────────────────────────

  private baseTemplate(content: string): string {
    const year = new Date().getFullYear();
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.07);">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%);padding:28px 40px;">
            <p style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">ImobMatch</p>
            <p style="color:#bfdbfe;margin:4px 0 0;font-size:12px;">A rede dos corretores que fecham mais</p>
          </div>
          <!-- Content -->
          <div style="padding:36px 40px;">
            ${content}
          </div>
          <!-- Footer -->
          <div style="background:#f9fafb;padding:18px 40px;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
              © ${year} ImobMatch · useimobmatch.com.br<br>
              Dúvidas? Fale conosco: <a href="mailto:contato@useimobmatch.com.br" style="color:#6b7280;">contato@useimobmatch.com.br</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
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
        Se você não criou uma conta no ImobMatch, pode ignorar este e-mail com segurança.
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:16px 0 0;word-break:break-all;">
        Link direto: ${verifyUrl}
      </p>
    `;

    await this.send(to, 'Confirme seu e-mail — ImobMatch', content);
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
        Se você não solicitou a redefinição, ignore este e-mail — sua senha continua a mesma.
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:16px 0 0;word-break:break-all;">
        Link direto: ${resetUrl}
      </p>
    `;

    await this.send(to, 'Redefinição de senha — ImobMatch', content);
  }

  // ─── Método interno de envio ─────────────────────────────────────────────────

  private async send(to: string, subject: string, content: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Email sent to ${to} — "${subject}"`);
    } catch (err) {
      this.logger.warn(`Failed to send email to ${to}: ${err.message}`);
      // Não rejeita — falha de e-mail não deve bloquear o fluxo principal
    }
  }
}
