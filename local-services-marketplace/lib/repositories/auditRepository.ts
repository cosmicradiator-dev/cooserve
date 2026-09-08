import { createServerClient } from '../supabase/server';
import { logger } from '../logger';

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  before: any;
  after: any;
  created_at: string;
  actor?: {
    full_name: string;
    username: string;
  };
}

export class AuditRepository {
  private client = createServerClient();

  async createEntry(entry: {
    actor_id: string;
    action: string;
    target_table: string;
    target_id: string;
    before?: any;
    after?: any;
  }): Promise<AuditLogRow> {
    const { data, error } = await this.client
      .from('audit_log')
      .insert(entry)
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Failed to write audit log entry', error: error.message, action: entry.action });
      // Non-blocking fallback
      return {
        id: 'mock-audit-id',
        ...entry,
        before: entry.before || null,
        after: entry.after || null,
        created_at: new Date().toISOString(),
      };
    }
    return data;
  }

  async listRecent(limit: number = 50): Promise<AuditLogRow[]> {
    const { data, error } = await this.client
      .from('audit_log')
      .select('*, actor:users!actor_id(full_name, username)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error({ msg: 'Failed to list audit log entries', error: error.message });
      return [];
    }
    return data || [];
  }
}

export const auditRepository = new AuditRepository();

