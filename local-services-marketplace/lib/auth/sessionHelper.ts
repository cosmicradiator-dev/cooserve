import { NextRequest } from 'next/server';
import { UserSession, UserRole } from './rbac';

export function getSessionFromRequest(request: NextRequest): UserSession | null {
  // 1. Check custom headers set by middleware or test harness
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role') as UserRole | null;
  const userEmail = request.headers.get('x-user-email') || undefined;

  if (userId && userRole) {
    return {
      id: userId,
      role: userRole,
      email: userEmail,
    };
  }

  // 2. Query param fallback for development/testing if header not present
  const queryUserId = request.nextUrl.searchParams.get('_mock_user_id');
  const queryRole = request.nextUrl.searchParams.get('_mock_role') as UserRole | null;
  if (queryUserId && queryRole) {
    return {
      id: queryUserId,
      role: queryRole,
    };
  }

  return null;
}

