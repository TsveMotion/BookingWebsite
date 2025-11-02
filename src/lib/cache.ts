import { redis } from './redis';

/**
 * Cache fetch utility - Fetches from cache or executes fetcher function
 * @param key - Cache key (should include user context like userId)
 * @param fetcher - Function to fetch fresh data if cache miss
 * @param ttl - Time to live in seconds (default: 60)
 */
export async function cacheFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  const startTime = Date.now();
  
  try {
    // Try to get from cache
    const cached = await redis.get(key);
    
    if (cached !== null) {
      const duration = Date.now() - startTime;
      console.log(`🎯 CACHE HIT (${duration}ms): ${key}`);
      return cached as T;
    }
    
    console.log(`❌ CACHE MISS: ${key} - Fetching fresh data...`);
    
    // Cache miss - fetch fresh data
    const data = await fetcher();
    
    // Store in cache with TTL
    await redis.set(key, data, { ex: ttl });
    
    const duration = Date.now() - startTime;
    console.log(`✅ CACHED (${duration}ms): ${key} (TTL: ${ttl}s)`);
    
    return data;
  } catch (error) {
    console.error(`⚠️ Cache error for ${key}:`, error);
    // Fallback to fetcher if Redis fails
    console.log(`🔄 Falling back to direct fetch for: ${key}`);
    return await fetcher();
  }
}

/**
 * Invalidate (delete) a specific cache key
 * @param key - Cache key to delete
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    console.log(`🗑️ INVALIDATED: ${key}`);
  } catch (error) {
    console.error(`⚠️ Failed to invalidate ${key}:`, error);
  }
}

/**
 * Invalidate multiple cache keys matching a pattern
 * @param pattern - Pattern to match (e.g., "dashboard:*" or "user:123:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    // Upstash Redis uses SCAN for pattern matching
    const keys = await redis.keys(pattern);
    
    if (keys && keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
      console.log(`🗑️ INVALIDATED ${keys.length} keys matching: ${pattern}`);
    } else {
      console.log(`ℹ️ No keys found matching: ${pattern}`);
    }
  } catch (error) {
    console.error(`⚠️ Failed to invalidate pattern ${pattern}:`, error);
  }
}

/**
 * Invalidate all cache for a specific user
 * @param userId - User ID to invalidate cache for
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await invalidateCachePattern(`*:${userId}:*`);
  await invalidateCachePattern(`user:${userId}:*`);
  await invalidateCachePattern(`dashboard:${userId}*`);
  await invalidateCachePattern(`billing:${userId}*`);
}

/**
 * Set a value in cache with TTL
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in seconds
 */
export async function setCache<T>(key: string, value: T, ttl: number = 60): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttl });
    console.log(`✅ SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`⚠️ Failed to set ${key}:`, error);
  }
}

/**
 * Get a value from cache
 * @param key - Cache key
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (value !== null) {
      console.log(`🎯 CACHE HIT: ${key}`);
    }
    return value as T | null;
  } catch (error) {
    console.error(`⚠️ Failed to get ${key}:`, error);
    return null;
  }
}

// Cache key builders for consistency
export const cacheKeys = {
  dashboard: {
    summary: (userId: string) => `dashboard:${userId}:summary`,
    revenue: (userId: string) => `dashboard:${userId}:revenue`,
    subscription: (userId: string) => `user:${userId}:subscription`,
  },
  billing: {
    data: (userId: string) => `billing:${userId}:data`,
    invoices: (userId: string) => `billing:${userId}:invoices`,
  },
  salon: {
    featured: () => `salons:featured`,
    reviews: () => `salons:reviews`,
    details: (salonId: string) => `salon:${salonId}:details`,
  },
  booking: {
    upcoming: (userId: string) => `bookings:${userId}:upcoming`,
    history: (userId: string) => `bookings:${userId}:history`,
  },
};
