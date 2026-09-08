import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CostEngineService } from '../../lib/services/costEngineService';
import { costParameterRepository } from '../../lib/repositories/costParameterRepository';

describe('CostEngineService', () => {
  let service: CostEngineService;

  beforeEach(() => {
    service = new CostEngineService();
    vi.restoreAllMocks();
  });

  it('calculates standard quote accurately based on dynamic parameters', async () => {
    vi.spyOn(costParameterRepository, 'getAll').mockResolvedValue({
      base_fare: 100,
      per_km_rate: 12,
      experience_multiplier: 5,
      urgency_multiplier: 1.5,
      service_type_default_multiplier: 1.0,
    });

    // formula: (base_fare + distance * per_km + experience * exp_mult) * urgency * service_mult
    // (100 + 5 * 12 + 2 * 5) * 1.0 * 1.0 = (100 + 60 + 10) = 170
    const quote = await service.calculateQuote({
      distanceKm: 5,
      experienceYears: 2,
      isUrgent: false,
      serviceType: 'electrician',
    });

    expect(quote.baseFare).toBe(100);
    expect(quote.distanceFare).toBe(60);
    expect(quote.experienceFare).toBe(10);
    expect(quote.urgencyMultiplier).toBe(1.0);
    expect(quote.totalQuote).toBe(170);
  });

  it('applies urgency multiplier when urgent dispatch requested', async () => {
    vi.spyOn(costParameterRepository, 'getAll').mockResolvedValue({
      base_fare: 100,
      per_km_rate: 10,
      experience_multiplier: 10,
      urgency_multiplier: 1.5,
      service_type_default_multiplier: 1.0,
    });

    // (100 + 10 * 10 + 3 * 10) * 1.5 = (100 + 100 + 30) * 1.5 = 230 * 1.5 = 345
    const quote = await service.calculateQuote({
      distanceKm: 10,
      experienceYears: 3,
      isUrgent: true,
      serviceType: 'plumber',
    });

    expect(quote.urgencyMultiplier).toBe(1.5);
    expect(quote.totalQuote).toBe(345);
  });
});

