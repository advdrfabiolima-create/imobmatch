import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
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

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const appUrl = this.config.get('FRONTEND_URL') || 'https://useimobmatch.com.br';
    const verifyUrl = `${appUrl}/verificar-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"ImobMatch" <${this.config.get('SMTP_USER')}>`,
        to,
        subject: 'Confirme seu e-mail — ImobMatch',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:32px 40px;">
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">ImobMatch</h1>
              </div>
              <div style="padding:40px;">
                <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Olá, ${name}!</h2>
                <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                  Obrigado por se cadastrar no ImobMatch! Para ativar sua conta, clique no botão abaixo:
                </p>
                <a href="${verifyUrl}"
                   style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">
                  Verificar meu e-mail
                </a>
                <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">
                  Este link expira em 24 horas. Se você não criou uma conta, ignore este e-mail.
                </p>
                <p style="color:#d1d5db;font-size:12px;margin:16px 0 0;word-break:break-all;">
                  Ou acesse: ${verifyUrl}
                </p>
              </div>
              <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  © ${new Date().getFullYear()} ImobMatch · useimobmatch.com.br
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (err) {
      this.logger.warn(`Failed to send verification email to ${to}: ${err.message}`);
      // Don't throw — registration should succeed even if email fails
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const appUrl = this.config.get('FRONTEND_URL') || 'https://useimobmatch.com.br';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"ImobMatch" <${this.config.get('SMTP_USER')}>`,
        to,
        subject: 'Redefinir senha — ImobMatch',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
            <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:32px 40px;">
                <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">ImobMatch</h1>
              </div>
              <div style="padding:40px;">
                <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Olá, ${name}!</h2>
                <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                  Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo:
                </p>
                <a href="${resetUrl}"
                   style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">
                  Redefinir minha senha
                </a>
                <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">
                  Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.
                </p>
              </div>
              <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  © ${new Date().getFullYear()} ImobMatch · useimobmatch.com.br
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (err) {
      this.logger.warn(`Failed to send password reset email to ${to}: ${err.message}`);
    }
  }
}
