import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  // Captura 10% das transações em produção para não estourar a cota
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Só envia eventos se DSN estiver configurado
  enabled: !!process.env.SENTRY_DSN,
});
