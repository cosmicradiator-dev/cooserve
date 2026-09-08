import { jobRepository, JobStatus, ServiceRequestRow } from '../repositories/jobRepository';
import { workerRepository } from '../repositories/workerRepository';
import { costEngineService } from './costEngineService';
import { assertRole, UserSession } from '../auth/rbac';
import { NotFoundError, UnauthorizedError } from '../http/errors';
import { CreateJobInput } from '../validation/jobSchema';

export class JobService {
  async createJob(session: UserSession, input: CreateJobInput): Promise<ServiceRequestRow> {
    assertRole(session, 'customer');

    // 1. Calculate live quote via dynamic cost engine
    const quoteBreakdown = await costEngineService.calculateQuote({
      serviceType: input.serviceType,
      distanceKm: 5, // Default radius distance
      experienceYears: 2,
      isUrgent: Boolean(input.isUrgent),
    });

    // 2. Query geo-matching engine for nearest verified worker
    const matchedWorkers = await workerRepository.findNearestWorkers(
      input.lat,
      input.lng,
      input.serviceType,
      1
    );

    const autoAssignedWorker = matchedWorkers[0];

    // 3. Create service request record
    const job = await jobRepository.create({
      customer_id: session.id,
      service_type: input.serviceType,
      worker_type_requested: input.workerTypeRequested,
      description: input.description,
      lat: input.lat,
      lng: input.lng,
      quoted_amount: quoteBreakdown.totalQuote,
      briefing: input.briefing || `Auto-matched based on proximity. Estimated charge: ₹${quoteBreakdown.totalQuote}`,
      worker_id: autoAssignedWorker ? autoAssignedWorker.user_id : undefined,
      status: autoAssignedWorker ? 'assigned' : 'pending',
    });

    return job;
  }

  async getJobById(session: UserSession, jobId: string): Promise<ServiceRequestRow> {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    // Role check: customer who owns it, assigned worker, or admin
    if (
      session.role !== 'admin' &&
      session.id !== job.customer_id &&
      session.id !== job.worker_id
    ) {
      throw new UnauthorizedError('Not authorized to access this job');
    }

    return job;
  }

  async listJobs(session: UserSession): Promise<ServiceRequestRow[]> {
    if (session.role === 'customer') {
      return jobRepository.listByCustomer(session.id);
    } else if (session.role === 'worker') {
      return jobRepository.listByWorker(session.id);
    } else if (session.role === 'admin') {
      return jobRepository.listAvailablePending();
    }
    return [];
  }

  async assignJob(session: UserSession, jobId: string, workerId: string): Promise<ServiceRequestRow> {
    // Admin or matching system can assign worker
    assertRole(session, ['admin', 'customer']);
    return jobRepository.assignWorker(jobId, workerId);
  }

  async updateStatus(session: UserSession, jobId: string, newStatus: JobStatus): Promise<ServiceRequestRow> {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    // Authorization check
    if (session.role === 'worker' && session.id !== job.worker_id) {
      throw new UnauthorizedError('Worker is not assigned to this job');
    }
    if (session.role === 'customer' && session.id !== job.customer_id) {
      throw new UnauthorizedError('Customer is not owner of this job');
    }

    return jobRepository.updateStatus(jobId, newStatus);
  }
}

export const jobService = new JobService();

