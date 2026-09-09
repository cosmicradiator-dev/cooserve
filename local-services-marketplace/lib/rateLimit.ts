import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from './logger';

const isRedisConfigured =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN) &&
  !process.env.UPSTASH_REDIS_REST_URL?.includes('your-upstash') &&
  !process.env.UPSTASH_REDIS_REST_TOKEN?.includes('your-upstash');

let redis: Redis | null = null;
if (isRedisConfigured) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (err) {
    logger.warn({ msg: 'Failed to initialize Upstash Redis client', error: String(err) });
  }
}

// In-memory fallback for local dev & testing when Upstash is unconfigured or unavailable
const inMemoryCache = new Map<string, { count: number; expiresAt: number }>();

class FallbackLimiter {
  constructor(private maxRequests: number, private windowMs: number) {}

  async limit(identifier: string) {
    const now = Date.now();
    const entry = inMemoryCache.get(identifier);

    if (!entry || entry.expiresAt < now) {
      inMemoryCache.set(identifier, { count: 1, expiresAt: now + this.windowMs });
      return { success: true, remaining: this.maxRequests - 1, reset: now + this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false, remaining: 0, reset: entry.expiresAt };
    }

    entry.count += 1;
    return { success: true, remaining: this.maxRequests - entry.count, reset: entry.expiresAt };
  }
}

class ResilientLimiter {
  private fallback: FallbackLimiter;

  constructor(
    private upstashLimiter: Ratelimit | null,
    maxRequests: number,
    windowMs: number
  ) {
    this.fallback = new FallbackLimiter(maxRequests, windowMs);
  }

  async limit(identifier: string) {
    if (this.upstashLimiter) {
      try {
        return await this.upstashLimiter.limit(identifier);
      } catch (err) {
        logger.warn({
          msg: 'Upstash rate limiter unreachable, using in-memory fallback',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return this.fallback.limit(identifier);
  }
}

export const authRateLimiter = new ResilientLimiter(
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'ratelimit:auth',
        analytics: true,
      })
    : null,
  20,
  60 * 1000
);

export const apiRateLimiter = new ResilientLimiter(
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        prefix: 'ratelimit:api',
        analytics: true,
      })
    : null,
  100,
  60 * 1000
);

export { redis };
