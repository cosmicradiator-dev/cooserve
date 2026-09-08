import { createServerClient } from '../supabase/server';
import { logger } from '../logger';

export interface CostParameterRow {
  key: string;
  value: number;
  updated_by?: string | null;
  updated_at?: string;
}

export class CostParameterRepository {
  private client = createServerClient();

  async getAll(): Promise<Record<string, number>> {
    const { data, error } = await this.client
      .from('cost_parameters')
      .select('key, value');

    if (error) {
      logger.error({ msg: 'Error fetching cost parameters', error: error.message });
      // Return hardcoded enterprise defaults if database is unseeded/mocked
      return {
        base_fare: 100,
        per_km_rate: 12,
        experience_multiplier: 5,
        urgency_multiplier: 1.5,
        service_type_default_multiplier: 1.0,
      };
    }

    const params: Record<string, number> = {};
    for (const row of data || []) {
      params[row.key] = Number(row.value);
    }
    return params;
  }

  async getByKey(key: string): Promise<number | null> {
    const { data, error } = await this.client
      .from('cost_parameters')
      .select('value')
      .eq('key', key)
      .single();

    if (error) return null;
    return Number(data.value);
  }

  async update(key: string, value: number, adminUserId: string): Promise<CostParameterRow> {
    const { data, error } = await this.client
      .from('cost_parameters')
      .upsert({
        key,
        value,
        updated_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error updating cost parameter', error: error.message, key, value });
      throw new Error(error.message);
    }
    return data;
  }
}

export const costParameterRepository = new CostParameterRepository();

