import { userRepository, UserRow } from '../repositories/userRepository';
import { workerRepository } from '../repositories/workerRepository';
import { assertRole, UserSession } from '../auth/rbac';
import { ValidationError, ConflictError } from '../http/errors';
import { SignupInput } from '../validation/signupSchema';

export class UserService {
  async registerUser(
    authUserId: string,
    input: SignupInput
  ): Promise<UserRow> {
    // Architecture rule: Admin accounts are NEVER self-service
    if (input.role as string === 'admin') {
      throw new ValidationError('Admin accounts cannot be self-registered');
    }

    // Check username uniqueness
    const existing = await userRepository.findByUsername(input.username);
    if (existing) {
      throw new ConflictError(`Username '${input.username}' is already taken`);
    }

    // Create user in public.users
    const user = await userRepository.createUser({
      id: authUserId,
      role: input.role,
      full_name: input.fullName,
      username: input.username,
      phone: input.phone,
      address: input.address,
    });

    // If worker, create worker profile row
    if (input.role === 'worker') {
      await workerRepository.createProfile({
        user_id: authUserId,
        skill_type: input.skillType || 'general_service',
        experience_years: input.experienceYears || 1,
      });
    }

    return user;
  }

  async getUserProfile(session: UserSession, targetUserId?: string): Promise<UserRow | null> {
    const userIdToFetch = targetUserId || session.id;

    // Customer and worker can only view their own user profile; admin can view all
    if (session.role !== 'admin' && session.id !== userIdToFetch) {
      assertRole(session, 'admin');
    }

    return userRepository.findById(userIdToFetch);
  }

  async updateProfile(
    session: UserSession,
    updates: Partial<Pick<UserRow, 'full_name' | 'phone' | 'address'>>
  ): Promise<UserRow> {
    // Caller can update their own profile
    assertRole(session, ['customer', 'worker', 'admin']);
    return userRepository.updateProfile(session.id, updates);
  }
}

export const userService = new UserService();

