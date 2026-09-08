import { costParameterRepository } from '../repositories/costParameterRepository';
import { auditRepository } from '../repositories/auditRepository';
import { assertRole, UserSession } from '../auth/rbac';
import { ValidationError } from '../http/errors';

export interface QuoteCalculationParams {
  distanceKm: number;
  experienceYears: number;
  isUrgent: boolean;
  serviceType: string;
}

export interface QuoteBreakdown {
  baseFare: number;
  distanceFare: number;
  experienceFare: number;
  urgencyMultiplier: number;
  serviceTypeMultiplier: number;
  totalQuote: number;
}

export class CostEngineService {
  /**
   * Calculates live quote using dynamic database parameters.
   */
  async calculateQuote(params: QuoteCalculationParams): Promise<QuoteBreakdown> {
    const costParams = await costParameterRepository.getAll();

    const baseFare = Number(costParams.base_fare ?? 100);
    const perKmRate = Number(costParams.per_km_rate ?? 12);
    const experienceMultiplier = Number(costParams.experience_multiplier ?? 5);
    const urgencyMultiplier = params.isUrgent ? Number(costParams.urgency_multiplier ?? 1.5) : 1.0;

    // Service-type specific multiplier or default
    const serviceTypeKey = `service_multiplier_${params.serviceType.toLowerCase()}`;
    const serviceTypeMultiplier = Number(
      costParams[serviceTypeKey] ?? costParams.service_type_default_multiplier ?? 1.0
    );

    const distanceFare = params.distanceKm * perKmRate;
    const experienceFare = params.experienceYears * experienceMultiplier;

    // Formula from Architecture Spec §16:
    // quote = (base_fare + distance_km * per_km_rate + experience_years * experience_multiplier) * (is_urgent ? urgency : 1) * service_type_multiplier
    const rawTotal = (baseFare + distanceFare + experienceFare) * urgencyMultiplier * serviceTypeMultiplier;
    const totalQuote = Math.round(rawTotal * 100) / 100;

    return {
      baseFare,
      distanceFare,
      experienceFare,
      urgencyMultiplier,
      serviceTypeMultiplier,
      totalQuote,
    };
  }

  /**
   * Retrieves all cost parameters.
   */
  async getParameters(session?: UserSession | null) {
    // Parameters can be read publicly for quote breakdown or inspected by admin
    return costParameterRepository.getAll();
  }

  /**
   * Updates cost parameter (Admin only with audit logging).
   */
  async updateParameter(session: UserSession, key: string, value: number) {
    assertRole(session, 'admin');

    if (value <= 0) {
      throw new ValidationError('Cost parameter value must be positive');
    }

    const previousValue = await costParameterRepository.getByKey(key);
    const updated = await costParameterRepository.update(key, value, session.id);

    // Write audit log entry
    await auditRepository.createEntry({
      actor_id: session.id,
      action: 'cost_parameters.update',
      target_table: 'cost_parameters',
      target_id: key,
      before: { [key]: previousValue },
      after: { [key]: value },
    });

    return updated;
  }
}

export const costEngineService = new CostEngineService();

