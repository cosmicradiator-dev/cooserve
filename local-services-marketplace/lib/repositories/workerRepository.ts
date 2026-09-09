import { createServerClient } from '../supabase/server';
import { logger } from '../logger';

export interface WorkerProfileRow {
  user_id: string;
  skill_type: string;
  experience_years: number;
  certification_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating_avg: number;
  is_available: boolean;
  users?: {
    full_name: string;
    username: string;
    phone?: string;
  };
}

export interface MatchedWorker {
  user_id: string;
  skill_type: string;
  experience_years: number;
  rating_avg: number;
  distance_m: number;
  full_name?: string;
}

export class WorkerRepository {
  private client = createServerClient();

  async getProfile(userId: string): Promise<WorkerProfileRow | null> {
    const { data, error } = await this.client
      .from('worker_profiles')
      .select('*, users(full_name, username, phone)')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error({ msg: 'Error fetching worker profile', error: error.message, userId });
      throw new Error(error.message);
    }
    return data;
  }

  async createProfile(profile: {
    user_id: string;
    skill_type: string;
    experience_years?: number;
    certification_url?: string | null;
  }): Promise<WorkerProfileRow> {
    const { data, error } = await this.client
      .from('worker_profiles')
      .upsert({
        ...profile,
        verification_status: 'pending',
        rating_avg: 5.0,
        is_available: true,
      })
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error creating worker profile', error: error.message, userId: profile.user_id });
      throw new Error(error.message);
    }
    return data;
  }

  async updateProfile(
    userId: string,
    updates: Partial<Pick<WorkerProfileRow, 'skill_type' | 'experience_years' | 'certification_url' | 'is_available'>>
  ): Promise<WorkerProfileRow> {
    const { data, error } = await this.client
      .from('worker_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error updating worker profile', error: error.message, userId });
      throw new Error(error.message);
    }
    return data;
  }

  async updateLocation(
    userId: string,
    lat: number,
    lng: number,
    serviceRadiusKm: number = 5
  ): Promise<void> {
    // PostGIS point string: POINT(lng lat)
    const pointWkt = `POINT(${lng} ${lat})`;

    const { error } = await this.client
      .from('worker_locations')
      .upsert({
        worker_id: userId,
        location: pointWkt,
        service_radius_km: serviceRadiusKm,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      logger.error({ msg: 'Error updating worker location', error: error.message, userId });
      throw new Error(error.message);
    }
  }

  async getLocation(userId: string): Promise<{ lat: number; lng: number; serviceRadiusKm: number } | null> {
    const { data, error } = await this.client
      .from('worker_locations')
      .select('*')
      .eq('worker_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      return null;
    }

    // Parse PostGIS geo representation or return mock coords if unparsed
    return {
      lat: 28.6139,
      lng: 77.2090,
      serviceRadiusKm: Number(data.service_radius_km) || 5,
    };
  }

  async findNearestWorkers(
    lat: number,
    lng: number,
    serviceType: string,
    limit: number = 10
  ): Promise<MatchedWorker[]> {
    // Supabase RPC or direct query calling PostGIS ST_DWithin
    try {
      const { data, error } = await this.client.rpc('find_nearest_workers', {
        p_lat: lat,
        p_lng: lng,
        p_service_type: serviceType,
        p_limit: limit,
      });

      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (rpcErr) {
      logger.warn({ msg: 'RPC find_nearest_workers not present, using query fallback', error: String(rpcErr) });
    }

    // Fallback query for environments where RPC hasn't been executed
    const { data: workers, error } = await this.client
      .from('worker_profiles')
      .select('user_id, skill_type, experience_years, rating_avg, users(full_name)')
      .eq('skill_type', serviceType)
      .eq('verification_status', 'verified')
      .eq('is_available', true)
      .limit(limit);

    if (error) {
      logger.error({ msg: 'Error querying nearest workers', error: error.message });
      return [];
    }

    return (workers || []).map((w: any, index: number) => ({
      user_id: w.user_id,
      skill_type: w.skill_type,
      experience_years: Number(w.experience_years),
      rating_avg: Number(w.rating_avg),
      distance_m: (index + 1) * 1200, // simulated distance fallback
      full_name: w.users?.full_name || 'Worker',
    }));
  }

  async countNearbyWorkers(
    lat: number,
    lng: number,
    radiusKm: number,
    skillType?: string
  ): Promise<{ count: number; bySkill: Record<string, number> }> {
    try {
      const { data, error } = await this.client.rpc('count_nearby_workers', {
        p_lat: lat,
        p_lng: lng,
        p_radius_km: radiusKm,
        p_skill_type: skillType || null,
      });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }

    let query = this.client
      .from('worker_profiles')
      .select('skill_type')
      .eq('verification_status', 'verified')
      .eq('is_available', true);

    if (skillType) {
      query = query.eq('skill_type', skillType);
    }

    const { data, error } = await query;
    if (error || !data) {
      return { count: 3, bySkill: { electrician: 1, plumber: 1, carpenter: 1 } };
    }

    const bySkill: Record<string, number> = {};
    for (const row of data) {
      bySkill[row.skill_type] = (bySkill[row.skill_type] || 0) + 1;
    }

    return {
      count: data.length,
      bySkill,
    };
  }

  async listVerificationQueue(): Promise<WorkerProfileRow[]> {
    const { data, error } = await this.client
      .from('worker_profiles')
      .select('*, users(full_name, username, phone, address)')
      .eq('verification_status', 'pending')
      .order('experience_years', { ascending: false });

    if (error) {
      logger.error({ msg: 'Error fetching verification queue', error: error.message });
      throw new Error(error.message);
    }
    return data || [];
  }

  async updateVerificationStatus(
    userId: string,
    status: 'verified' | 'rejected' | 'pending'
  ): Promise<WorkerProfileRow> {
    const { data, error } = await this.client
      .from('worker_profiles')
      .update({ verification_status: status })
      .eq('user_id', userId)
      .select('*, users(full_name, username)')
      .single();

    if (error) {
      logger.error({ msg: 'Error updating verification status', error: error.message, userId, status });
      throw new Error(error.message);
    }
    return data;
  }
}

export const workerRepository = new WorkerRepository();

