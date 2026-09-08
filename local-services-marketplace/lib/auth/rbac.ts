import { UnauthorizedError, AuthenticationRequiredError } from '../http/errors';

export type UserRole = 'admin' | 'worker' | 'customer';

export interface UserSession {
  id: string;
  role: UserRole;
  email?: string;
  username?: string;
}

/**
 * Service-level RBAC enforcement.
 * Re-checks user identity and role directly in business logic.
 */
export function assertRole(
  session: UserSession | null | undefined,
  allowedRoles: UserRole | UserRole[]
): asserts session is UserSession {
  if (!session || !session.id) {
    throw new AuthenticationRequiredError('Authentication required to access this service');
  }

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!allowed.includes(session.role)) {
    throw new UnauthorizedError(
      `Forbidden: Action requires role [${allowed.join(', ')}], but current user role is '${session.role}'`
    );
  }
}

/**
 * Checks if a session has an allowed role without throwing.
 */
export function hasRole(
  session: UserSession | null | undefined,
  allowedRoles: UserRole | UserRole[]
): boolean {
  if (!session || !session.id) return false;
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return allowed.includes(session.role);
}

