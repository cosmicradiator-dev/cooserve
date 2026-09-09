import { NextRequest, NextResponse } from 'next/server';
import { authRateLimiter, apiRateLimiter } from './lib/rateLimit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // 1. Rate Limiting Check on API routes
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

  // 2. Extract session / role from cookie
  const roleCookie = request.cookies.get('coop_user_role')?.value;
  const userIdCookie = request.cookies.get('coop_user_id')?.value;
  const isAuthenticated = Boolean(roleCookie && userIdCookie);

  // Helper to determine destination for authenticated user
  const getAuthenticatedRedirectUrl = (role: string | undefined) => {
    if (role === 'worker') return new URL('/worker/dashboard', request.url);
    if (role === 'admin') return new URL('/admin/dashboard', request.url);
    return new URL('/customer/request', request.url);
  };

  // 3. Website Root Path Enforcement (must be logged in to access platform)
  if (pathname === '/') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
    return NextResponse.redirect(getAuthenticatedRedirectUrl(roleCookie), 307);
  }

  // 4. Prevent authenticated users from visiting login or signup again
  if (pathname === '/login' || pathname === '/signup') {
    if (isAuthenticated) {
      return NextResponse.redirect(getAuthenticatedRedirectUrl(roleCookie), 307);
    }
  }

  // 5. Protected Role Portals - Strict Authentication & RBAC Guard
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login?error=login_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
    if (roleCookie !== 'admin') {
      const loginUrl = new URL('/login?error=admin_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  if (pathname.startsWith('/worker')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login?error=login_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
    if (roleCookie !== 'worker' && roleCookie !== 'admin') {
      const loginUrl = new URL('/login?error=worker_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  if (pathname.startsWith('/customer')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login?error=login_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
    if (roleCookie !== 'customer' && roleCookie !== 'admin') {
      const loginUrl = new URL('/login?error=customer_required', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  // 6. Forward headers with request-id and user context
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  if (isAuthenticated && roleCookie && userIdCookie) {
    requestHeaders.set('x-user-id', userIdCookie);
    requestHeaders.set('x-user-role', roleCookie);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-request-id', requestId);
  if (isAuthenticated && roleCookie && userIdCookie) {
    response.headers.set('x-user-id', userIdCookie);
    response.headers.set('x-user-role', roleCookie);
  }
  return response;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/admin/:path*',
    '/worker/:path*',
    '/customer/:path*',
    '/api/v1/:path*',
  ],
};
