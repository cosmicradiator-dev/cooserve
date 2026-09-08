import { createServerClient } from '../supabase/server';
import { logger } from '../logger';

export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceRequestRow {
  id: string;
  customer_id: string;
  worker_id: string | null;
  service_type: string;
  worker_type_requested?: string | null;
  description: string;
  location?: any;
  status: JobStatus;
  briefing?: string | null;
  quoted_amount: number;
  created_at: string;
  scheduled_at?: string | null;
  customer?: {
    full_name: string;
    phone?: string;
  };
  worker?: {
    full_name: string;
    phone?: string;
  };
}

export class JobRepository {
  private client = createServerClient();

  async create(jobData: {
    customer_id: string;
    service_type: string;
    worker_type_requested?: string;
    description: string;
    lat: number;
    lng: number;
    quoted_amount: number;
    briefing?: string;
    worker_id?: string;
    status?: JobStatus;
  }): Promise<ServiceRequestRow> {
    const pointWkt = `POINT(${jobData.lng} ${jobData.lat})`;

    const { data, error } = await this.client
      .from('service_requests')
      .insert({
        customer_id: jobData.customer_id,
        service_type: jobData.service_type,
        worker_type_requested: jobData.worker_type_requested,
        description: jobData.description,
        location: pointWkt,
        quoted_amount: jobData.quoted_amount,
        briefing: jobData.briefing,
        worker_id: jobData.worker_id || null,
        status: jobData.status || 'pending',
      })
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error creating service request', error: error.message });
      throw new Error(error.message);
    }
    return data;
  }

  async findById(id: string): Promise<ServiceRequestRow | null> {
    const { data, error } = await this.client
      .from('service_requests')
      .select('*, customer:users!customer_id(full_name, phone), worker:users!worker_id(full_name, phone)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error({ msg: 'Error finding job by id', error: error.message, jobId: id });
      throw new Error(error.message);
    }
    return data;
  }

  async listByCustomer(customerId: string): Promise<ServiceRequestRow[]> {
    const { data, error } = await this.client
      .from('service_requests')
      .select('*, worker:users!worker_id(full_name, phone)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ msg: 'Error listing customer jobs', error: error.message, customerId });
      throw new Error(error.message);
    }
    return data || [];
  }

  async listByWorker(workerId: string): Promise<ServiceRequestRow[]> {
    const { data, error } = await this.client
      .from('service_requests')
      .select('*, customer:users!customer_id(full_name, phone)')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ msg: 'Error listing worker jobs', error: error.message, workerId });
      throw new Error(error.message);
    }
    return data || [];
  }

  async listAvailablePending(serviceType?: string): Promise<ServiceRequestRow[]> {
    let query = this.client
      .from('service_requests')
      .select('*, customer:users!customer_id(full_name, phone)')
      .eq('status', 'pending');

    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      logger.error({ msg: 'Error listing pending jobs', error: error.message });
      throw new Error(error.message);
    }
    return data || [];
  }

  async updateStatus(id: string, status: JobStatus): Promise<ServiceRequestRow> {
    const { data, error } = await this.client
      .from('service_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error updating job status', error: error.message, jobId: id, status });
      throw new Error(error.message);
    }
    return data;
  }

  async assignWorker(id: string, workerId: string): Promise<ServiceRequestRow> {
    const { data, error } = await this.client
      .from('service_requests')
      .update({
        worker_id: workerId,
        status: 'assigned',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error assigning worker to job', error: error.message, jobId: id, workerId });
      throw new Error(error.message);
    }
    return data;
  }
}

export const jobRepository = new JobRepository();

