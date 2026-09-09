import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';

describe('Authentication & Route Protection Middleware', () => {
  it('redirects unauthenticated visitor from root "/" to "/login"', async () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirects unauthenticated visitor from "/worker/dashboard" to "/login?error=login_required"', async () => {
    const req = new NextRequest('http://localhost:3000/worker/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?error=login_required');
  });

  it('redirects unauthenticated visitor from "/customer/request" to "/login?error=login_required"', async () => {
    const req = new NextRequest('http://localhost:3000/customer/request');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?error=login_required');
  });

  it('redirects unauthenticated visitor from "/admin/dashboard" to "/login?error=login_required"', async () => {
    const req = new NextRequest('http://localhost:3000/admin/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?error=login_required');
  });

  it('redirects role-mismatched customer away from "/worker/dashboard"', async () => {
    const req = new NextRequest('http://localhost:3000/worker/dashboard', {
      headers: {
        cookie: 'coop_user_role=customer; coop_user_id=cust-123',
      },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?error=worker_required');
  });

  it('redirects role-mismatched worker away from "/admin/dashboard"', async () => {
    const req = new NextRequest('http://localhost:3000/admin/dashboard', {
      headers: {
        cookie: 'coop_user_role=worker; coop_user_id=worker-123',
      },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?error=admin_required');
  });

  it('allows authenticated worker to access "/worker/dashboard"', async () => {
    const req = new NextRequest('http://localhost:3000/worker/dashboard', {
      headers: {
        cookie: 'coop_user_role=worker; coop_user_id=worker-123',
      },
    });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('x-user-role')).toBe('worker');
    expect(res.headers.get('x-user-id')).toBe('worker-123');
  });

  it('redirects authenticated worker visiting root "/" to "/worker/dashboard"', async () => {
    const req = new NextRequest('http://localhost:3000/', {
      headers: {
        cookie: 'coop_user_role=worker; coop_user_id=worker-123',
      },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/worker/dashboard');
  });
});
