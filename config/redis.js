const { Redis } = require('@upstash/redis');

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN
});

redis.on('connect', () => {
    console.log('Connected to Upstash Redis');
});

module.exports = redis;
