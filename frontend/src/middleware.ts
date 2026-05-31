import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verificar-email',
  '/lista-vip',
  '/em-breve',
  '/para-corretores',
  '/termos',
  '/privacidade',
  '/aceitar-convite',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Libera arquivos estáticos e APIs internas do Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // arquivos estáticos (favicon, imagens, etc.)
  ) {
    return NextResponse.next();
  }

  // Libera rotas públicas
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Verifica cookie de autenticação
  const hasAuth = request.cookies.get('access_token');
  if (!hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
