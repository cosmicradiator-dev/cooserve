import { NextRequest, NextResponse } from 'next/server';
import { authRateLimiter, apiRateLimiter } from './lib/rateLimit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // 1. Rate Limiting Check
  const clientIp = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  if (pathname.startsWith('/api/v1/auth')) {
    const { success } = await authRateLimiter.limit(`ip:${clientIp}:auth`);
    if (!success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts. Please try again later.' } },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  } else if (pathname.startsWith('/api/v1')) {
    const { success } = await apiRateLimiter.limit(`ip:${clientIp}:api`);
    if (!success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Please slow down.' } },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // 2. Extract session / role from cookie or auth header
  // In Next.js + Supabase Auth with custom claims:
  const roleCookie = request.cookies.get('coop_user_role')?.value;
  const userIdCookie = request.cookies.get('coop_user_id')?.value;

  // Clone headers and attach x-request-id + resolved role if present
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  if (roleCookie && userIdCookie) {
    requestHeaders.set('x-user-id', userIdCookie);
    requestHeaders.set('x-user-role', roleCookie);
  }

  // 3. Layer 1 Role Guard (307 redirect away from role-mismatched routes)
  if (pathname.startsWith('/admin')) {
    if (roleCookie !== 'admin') {
      const loginUrl = new URL('/login?error=admin_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  if (pathname.startsWith('/worker')) {
    if (roleCookie !== 'worker' && roleCookie !== 'admin') {
      const loginUrl = new URL('/login?error=worker_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  if (pathname.startsWith('/customer')) {
    if (roleCookie !== 'customer' && roleCookie !== 'admin') {
      const loginUrl = new URL('/login?error=customer_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/worker/:path*',
    '/customer/:path*',
    '/api/v1/:path*',
  ],
};

