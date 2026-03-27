const Redis = require('ioredis');

let redisClient = null;

const getRedisClient = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number.parseInt(process.env.REDIS_DB) || 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  });

  redisClient.on('connect', () => {
    console.log('✓ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error('✗ Redis connection error:', err.message);
  });

  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

module.exports = {
  getRedisClient,
  closeRedis
};
