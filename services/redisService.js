const { Redis } = require("@upstash/redis");

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
});

module.exports = {
    setCache: async (key, value, ttl = 3600) => {
        await redis.set(key, JSON.stringify(value), { ex: ttl });
    },

    getCache: async (key) => {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    },

    deleteCache: async (key) => {
        await redis.del(key);
    },

    incrementLimit: async (key) => {
        return await redis.incr(key);
    }
};
