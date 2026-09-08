import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from './logger';

const isRedisConfigured =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

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

// In-memory fallback for local dev & testing when Upstash is unconfigured
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

export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      prefix: 'ratelimit:auth',
      analytics: true,
    })
  : new FallbackLimiter(20, 60 * 1000);

export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      prefix: 'ratelimit:api',
      analytics: true,
    })
  : new FallbackLimiter(100, 60 * 1000);

export { redis };

