import { describe, it, expect } from 'vitest';
import { signupSchema } from '../../lib/validation/signupSchema';
import { createJobSchema } from '../../lib/validation/jobSchema';
import { updateWorkerLocationSchema } from '../../lib/validation/workerSchema';
import { updateCostParameterSchema } from '../../lib/validation/costParameterSchema';

describe('Zod Validation Schemas', () => {
  it('rejects self-signup with admin role', () => {
    const invalidAdminSignup = {
      email: 'admin@coop.org',
      password: 'password123',
      fullName: 'Super Admin',
      username: 'admin',
      role: 'admin',
    };

    const result = signupSchema.safeParse(invalidAdminSignup);
    expect(result.success).toBe(false);
  });

  it('accepts valid worker signup', () => {
    const validWorker = {
      email: 'ramesh@coop.org',
      password: 'strongPassword123',
      fullName: 'Ramesh Sharma',
      username: 'ramesh_elec',
      role: 'worker',
      skillType: 'electrician',
      experienceYears: 5,
    };

    const result = signupSchema.safeParse(validWorker);
    expect(result.success).toBe(true);
  });

  it('validates worker location coordinates range', () => {
    expect(updateWorkerLocationSchema.safeParse({ lat: 28.6139, lng: 77.2090, serviceRadiusKm: 5 }).success).toBe(true);
    // Out of bounds lat
    expect(updateWorkerLocationSchema.safeParse({ lat: 100, lng: 77.2090 }).success).toBe(false);
  });

  it('validates cost parameter updates require positive numbers', () => {
    expect(updateCostParameterSchema.safeParse({ key: 'base_fare', value: 120 }).success).toBe(true);
    expect(updateCostParameterSchema.safeParse({ key: 'base_fare', value: -10 }).success).toBe(false);
  });
});

