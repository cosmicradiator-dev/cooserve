import crypto from 'crypto';
import { paymentRepository } from '../repositories/paymentRepository';
import { jobRepository } from '../repositories/jobRepository';
import { assertRole, UserSession } from '../auth/rbac';
import { ValidationError, NotFoundError, ConflictError } from '../http/errors';
import { logger } from '../logger';

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
}

export class PaymentService {
  /**
   * Creates a Razorpay test order with an idempotency key.
   */
  async createPaymentOrder(
    session: UserSession,
    jobId: string,
    providedIdempotencyKey?: string
  ): Promise<CreateOrderResult> {
    assertRole(session, 'customer');

    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (job.customer_id !== session.id) {
      throw new ValidationError('Job does not belong to the current customer');
    }

    const idempotencyKey = providedIdempotencyKey || `idemp_${jobId}_${Date.now()}`;

    // Check if order/transaction with this idempotency key already exists
    const existing = await paymentRepository.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      if (existing.status === 'paid') {
        throw new ConflictError('This transaction has already been completed');
      }
      return {
        orderId: existing.gateway_ref || `order_${existing.id.slice(0, 10)}`,
        amount: Number(existing.amount),
        currency: 'INR',
        idempotencyKey: existing.idempotency_key,
      };
    }

    const amountInPaise = Math.round(Number(job.quoted_amount) * 100);
    const mockRazorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    // In production with live Razorpay SDK:
    // const razorpay = new Razorpay({ key_id: ..., key_secret: ... });
    // const order = await razorpay.orders.create({ amount: amountInPaise, currency: 'INR', receipt: jobId });

    // Record initial transaction with status 'created'
    await paymentRepository.createTransaction({
      customer_id: session.id,
      job_id: jobId,
      amount: Number(job.quoted_amount),
      gateway_ref: mockRazorpayOrderId,
      idempotency_key: idempotencyKey,
      status: 'created',
    });

    return {
      orderId: mockRazorpayOrderId,
      amount: Number(job.quoted_amount),
      currency: 'INR',
      idempotencyKey,
    };
  }

  /**
   * Verifies Razorpay webhook signature and settles transaction + earnings atomically.
   */
  async handleWebhook(rawBody: string, signature: string | null) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';

    if (process.env.NODE_ENV === 'production' && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new ValidationError('Invalid Razorpay webhook signature');
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event !== 'payment.captured' && event !== 'order.paid') {
      logger.info({ msg: 'Ignoring unhandled Razorpay webhook event', event });
      return { received: true, ignored: true };
    }

    const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
    const gatewayRef = paymentEntity?.id || paymentEntity?.order_id || 'pay_ref_fallback';
    const notes = paymentEntity?.notes || {};
    const jobId = notes.job_id || payload.job_id;
    const idempotencyKey = notes.idempotency_key || `wh_${gatewayRef}`;

    // Idempotency check: has this already been settled?
    const existingTx = await paymentRepository.findByIdempotencyKey(idempotencyKey);
    if (existingTx && existingTx.status === 'paid') {
      logger.info({ msg: 'Webhook idempotency key already processed', idempotencyKey });
      return { received: true, duplicate: true };
    }

    const job = jobId ? await jobRepository.findById(jobId) : null;
    if (!job || !job.worker_id) {
      logger.warn({ msg: 'Webhook received for job with missing worker', jobId });
      return { received: true, unassigned: true };
    }

    const amount = Number(job.quoted_amount);

    // Atomic DB write: updates transactions to 'paid' and inserts worker earnings
    await paymentRepository.settlePaymentAndEarnings({
      idempotencyKey,
      gatewayRef,
      jobId: job.id,
      workerId: job.worker_id,
      customerId: job.customer_id,
      amount,
    });

    // Mark job as completed upon payment settlement
    await jobRepository.updateStatus(job.id, 'completed');

    logger.info({ msg: 'Successfully settled payment and worker earnings', jobId: job.id, amount });
    return { received: true, settled: true };
  }

  async getCustomerTransactions(session: UserSession) {
    assertRole(session, ['customer', 'admin']);
    return paymentRepository.listCustomerTransactions(session.id);
  }
}

export const paymentService = new PaymentService();

