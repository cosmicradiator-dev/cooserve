import { workerRepository } from '../repositories/workerRepository';
import { redis } from '../rateLimit';
import { logger } from '../logger';

export interface NearbyWorkersCountResult {
  count: number;
  bySkill: Record<string, number>;
  source: 'cache' | 'database';
  cachedAt: string;
}

export class NearbyWorkersService {
  /**
   * Person-4 Core Method:
   * Queries nearby verified and available workers within radius,
   * cached in Upstash Redis with a 15-second TTL keyed by geo-bucket.
   */
  async getNearbyWorkersCount(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    skillType?: string
  ): Promise<NearbyWorkersCountResult> {
    // Geo-bucket key: round lat/lng to ~100m grid for effective caching
    const roundedLat = lat.toFixed(2);
    const roundedLng = lng.toFixed(2);
    const cacheKey = `nearby_workers:${roundedLat}:${roundedLng}:${radiusKm}:${skillType || 'all'}`;

    if (redis) {
      try {
        const cached = await redis.get<NearbyWorkersCountResult>(cacheKey);
        if (cached) {
          return {
            ...cached,
            source: 'cache',
          };
        }
      } catch (err) {
        logger.warn({ msg: 'Redis cache get failed in nearbyWorkersService', error: String(err) });
      }
    }

    // Query database via WorkerRepository
    const dbResult = await workerRepository.countNearbyWorkers(lat, lng, radiusKm, skillType);

    const result: NearbyWorkersCountResult = {
      count: dbResult.count,
      bySkill: dbResult.bySkill,
      source: 'database',
      cachedAt: new Date().toISOString(),
    };

    if (redis) {
      try {
        // Cache for 15 seconds
        await redis.set(cacheKey, result, { ex: 15 });
      } catch (err) {
        logger.warn({ msg: 'Redis cache set failed in nearbyWorkersService', error: String(err) });
      }
    }

    return result;
  }
}

export const nearbyWorkersService = new NearbyWorkersService();

