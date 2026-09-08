import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NearbyWorkersService } from '../../lib/services/nearbyWorkersService';
import { workerRepository } from '../../lib/repositories/workerRepository';

describe('Person-4 NearbyWorkersService', () => {
  let service: NearbyWorkersService;

  beforeEach(() => {
    service = new NearbyWorkersService();
    vi.restoreAllMocks();
  });

  it('aggregates nearby available workers grouped by skill type', async () => {
    vi.spyOn(workerRepository, 'countNearbyWorkers').mockResolvedValue({
      count: 4,
      bySkill: { electrician: 2, plumber: 1, carpenter: 1 },
    });

    const result = await service.getNearbyWorkersCount(28.6139, 77.2090, 10);

    expect(result.count).toBe(4);
    expect(result.bySkill.electrician).toBe(2);
    expect(result.bySkill.plumber).toBe(1);
    expect(result.cachedAt).toBeDefined();
  });
});

