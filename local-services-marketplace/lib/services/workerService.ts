import { workerRepository, WorkerProfileRow } from '../repositories/workerRepository';
import { paymentRepository } from '../repositories/paymentRepository';
import { auditRepository } from '../repositories/auditRepository';
import { assertRole, UserSession } from '../auth/rbac';
import { NotFoundError } from '../http/errors';

export class WorkerService {
  async getProfile(session: UserSession, targetWorkerId?: string): Promise<WorkerProfileRow> {
    const workerId = targetWorkerId || session.id;

    if (session.role !== 'admin' && session.id !== workerId) {
      assertRole(session, 'admin');
    }

    const profile = await workerRepository.getProfile(workerId);
    if (!profile) {
      throw new NotFoundError('Worker profile not found');
    }
    return profile;
  }

  async updateLocation(
    session: UserSession,
    lat: number,
    lng: number,
    serviceRadiusKm: number = 5
  ) {
    assertRole(session, 'worker');
    await workerRepository.updateLocation(session.id, lat, lng, serviceRadiusKm);
    return { success: true, lat, lng, serviceRadiusKm };
  }

  async getLocation(session: UserSession) {
    assertRole(session, ['worker', 'admin']);
    return workerRepository.getLocation(session.id);
  }

  async updateProfile(
    session: UserSession,
    updates: Partial<Pick<WorkerProfileRow, 'skill_type' | 'experience_years' | 'certification_url' | 'is_available'>>
  ) {
    assertRole(session, ['worker', 'admin']);
    return workerRepository.updateProfile(session.id, updates);
  }

  async getEarnings(session: UserSession, targetWorkerId?: string) {
    const workerId = targetWorkerId || session.id;

    if (session.role !== 'admin' && session.id !== workerId) {
      assertRole(session, 'admin');
    }

    const earnings = await paymentRepository.listWorkerEarnings(workerId);
    const totalAmount = earnings.reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      totalAmount,
      currency: 'INR',
      count: earnings.length,
      history: earnings,
    };
  }

  // --------------------------------------------------------------------------
  // Admin-Only Verification Methods
  // --------------------------------------------------------------------------

  async getVerificationQueue(session: UserSession) {
    assertRole(session, 'admin');
    return workerRepository.listVerificationQueue();
  }

  async verifyWorker(
    session: UserSession,
    targetWorkerId: string,
    status: 'verified' | 'rejected' | 'pending'
  ) {
    assertRole(session, 'admin');

    const beforeProfile = await workerRepository.getProfile(targetWorkerId);
    const updated = await workerRepository.updateVerificationStatus(targetWorkerId, status);

    // Audit logging for enterprise compliance
    await auditRepository.createEntry({
      actor_id: session.id,
      action: 'worker.verify',
      target_table: 'worker_profiles',
      target_id: targetWorkerId,
      before: { verification_status: beforeProfile?.verification_status },
      after: { verification_status: status },
    });

    return updated;
  }
}

export const workerService = new WorkerService();

