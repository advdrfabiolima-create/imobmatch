const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* → NestJS backend (garante que webhooks externos como Asaas funcionem
  // mesmo quando o nginx não está interceptando a rota antes do Next.js)
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',             port: '3001', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '*.useimobmatch.com.br',              pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Token de autenticação para upload de source maps (CI/CD)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Não polui os logs locais
  silent: !process.env.CI,

  // Faz upload de source maps maiores (melhores stack traces)
  widenClientFileUpload: true,

  // Não expõe source maps no bundle enviado ao cliente
  hideSourceMaps: true,

  // Remove logs internos do SDK do bundle de produção
  disableLogger: true,
});
