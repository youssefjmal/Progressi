import 'server-only';
import { Redis } from '@upstash/redis';

let redisClient: Redis | null | undefined;

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

export function isRedisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient;
  }

  redisClient = createRedisClient();
  return redisClient;
}

export async function getOrSetRedisCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const redis = getRedisClient();

  if (!redis) {
    return loader();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }
  } catch (error) {
    console.error(`[redis-cache] failed to read ${key}`, error);
  }

  const fresh = await loader();

  try {
    await redis.setex(key, ttlSeconds, fresh);
  } catch (error) {
    console.error(`[redis-cache] failed to write ${key}`, error);
  }

  return fresh;
}
