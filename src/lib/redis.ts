import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
// Uses REST API for serverless compatibility with Vercel
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Test connection and log status
const testConnection = async () => {
  try {
    await redis.ping();
    console.log('✅ Redis connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
};

// Auto-test connection on initialization (only in development)
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

export { redis, testConnection };
