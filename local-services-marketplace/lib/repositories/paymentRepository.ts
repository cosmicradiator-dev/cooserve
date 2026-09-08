import { createServerClient } from '../supabase/server';
import { logger } from '../logger';

export interface TransactionRow {
  id: string;
  customer_id: string;
  job_id: string;
  amount: number;
  gateway_ref?: string | null;
  idempotency_key: string;
  status: string;
  created_at: string;
}

export interface EarningRow {
  id: string;
  worker_id: string;
  job_id: string;
  amount: number;
  earned_at: string;
  service_requests?: {
    service_type: string;
    description: string;
  };
}

export class PaymentRepository {
  private client = createServerClient();

  async findByIdempotencyKey(key: string): Promise<TransactionRow | null> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('idempotency_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error({ msg: 'Error querying idempotency key', error: error.message, key });
      throw new Error(error.message);
    }
    return data;
  }

  async createTransaction(transaction: {
    customer_id: string;
    job_id: string;
    amount: number;
    gateway_ref?: string;
    idempotency_key: string;
    status?: string;
  }): Promise<TransactionRow> {
    const { data, error } = await this.client
      .from('transactions')
      .insert({
        ...transaction,
        status: transaction.status || 'created',
      })
      .select()
      .single();

    if (error) {
      logger.error({ msg: 'Error creating transaction', error: error.message, key: transaction.idempotency_key });
      throw new Error(error.message);
    }
    return data;
  }

  async settlePaymentAndEarnings(params: {
    transactionId?: string;
    idempotencyKey: string;
    gatewayRef: string;
    jobId: string;
    workerId: string;
    customerId: string;
    amount: number;
  }): Promise<{ transaction: TransactionRow; earning: EarningRow }> {
    // 1. Update or upsert transaction
    const { data: tx, error: txError } = await this.client
      .from('transactions')
      .upsert({
        customer_id: params.customerId,
        job_id: params.jobId,
        amount: params.amount,
        gateway_ref: params.gatewayRef,
        idempotency_key: params.idempotencyKey,
        status: 'paid',
      }, { onConflict: 'idempotency_key' })
      .select()
      .single();

    if (txError) {
      logger.error({ msg: 'Failed to update transaction status to paid', error: txError.message });
      throw new Error(txError.message);
    }

    // 2. Insert matching worker earnings row
    const { data: earning, error: earnError } = await this.client
      .from('earnings')
      .insert({
        worker_id: params.workerId,
        job_id: params.jobId,
        amount: params.amount,
      })
      .select()
      .single();

    if (earnError) {
      logger.error({ msg: 'Failed to credit worker earnings', error: earnError.message });
      // In a production Supabase setup with RPC, both occur inside a SQL BEGIN...COMMIT
      throw new Error(earnError.message);
    }

    return { transaction: tx, earning };
  }

  async listCustomerTransactions(customerId: string): Promise<TransactionRow[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ msg: 'Error listing customer transactions', error: error.message, customerId });
      throw new Error(error.message);
    }
    return data || [];
  }

  async listWorkerEarnings(workerId: string): Promise<EarningRow[]> {
    const { data, error } = await this.client
      .from('earnings')
      .select('*, service_requests(service_type, description)')
      .eq('worker_id', workerId)
      .order('earned_at', { ascending: false });

    if (error) {
      logger.error({ msg: 'Error listing worker earnings', error: error.message, workerId });
      throw new Error(error.message);
    }
    return data || [];
  }
}

export const paymentRepository = new PaymentRepository();

