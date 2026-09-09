import { createServerClient } from '../supabase/server';
import { UserRole } from '../auth/rbac';
import { logger } from '../logger';

export interface UserRow {
  id: string;
  role: UserRole;
  full_name: string;
  username: string;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
}

export class UserRepository {
  private client = createServerClient();

  async findById(id: string): Promise<UserRow | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      logger.error({ msg: 'Error finding user by id', error: error.message, userId: id });
      throw new Error(error.message);
    }
    return data;
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error({ msg: 'Error finding user by username', error: error.message, username });
      throw new Error(error.message);
    }
    return data;
  }

  async createUser(user: {
    id: string;
    role: UserRole;
    full_name: string;
    username: string;
    phone?: string;
    address?: string;
  }): Promise<UserRow> {
    const { data, error } = await this.client
      .from('users')
      .upsert(user)
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error creating user row', error: error.message, userId: user.id });
      throw new Error(error.message);
    }
    return data;
  }

  async updateProfile(
    id: string,
    updates: Partial<Pick<UserRow, 'full_name' | 'phone' | 'address'>>
  ): Promise<UserRow> {
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error updating user profile', error: error.message, userId: id });
      throw new Error(error.message);
    }
    return data;
  }
}

export const userRepository = new UserRepository();

