import { describe, it, expect } from 'vitest';
import { assertRole, hasRole, UserSession } from '../../lib/auth/rbac';
import { UnauthorizedError, AuthenticationRequiredError } from '../../lib/http/errors';

describe('RBAC Service Layer Enforcement', () => {
  it('allows access when user has matching role', () => {
    const adminSession: UserSession = { id: 'admin-1', role: 'admin' };
    expect(() => assertRole(adminSession, 'admin')).not.toThrow();

    const workerSession: UserSession = { id: 'worker-1', role: 'worker' };
    expect(() => assertRole(workerSession, ['worker', 'admin'])).not.toThrow();
  });

  it('throws UnauthorizedError when role does not match', () => {
    const customerSession: UserSession = { id: 'cust-1', role: 'customer' };
    expect(() => assertRole(customerSession, 'admin')).toThrow(UnauthorizedError);
  });

  it('throws AuthenticationRequiredError when session is missing', () => {
    expect(() => assertRole(null, 'worker')).toThrow(AuthenticationRequiredError);
    expect(() => assertRole(undefined, 'customer')).toThrow(AuthenticationRequiredError);
  });

  it('correctly evaluates hasRole boolean check', () => {
    const workerSession: UserSession = { id: 'worker-1', role: 'worker' };
    expect(hasRole(workerSession, 'worker')).toBe(true);
    expect(hasRole(workerSession, 'admin')).toBe(false);
    expect(hasRole(null, 'worker')).toBe(false);
  });
});

