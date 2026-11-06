// src/config/redis.js
const IORedis = require('ioredis');

const {
    REDIS_HOST = 'redis',
    REDIS_PORT = 6379,
    REDIS_PASSWORD = '',
    NODE_ENV,
} = process.env;

const commonOpts = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD || undefined,
    // 禁用離線佇列，避免在 Redis 真正斷線時堆積請求
    enableOfflineQueue: false,
    // 自動重試策略
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // 每次請求的最大重試次數
    maxRetriesPerRequest: 5,
};

let client;
if (process.env.REDIS_CLUSTER === 'true') {
    // 若使用 Redis Cluster
    client = new IORedis.Cluster(
        [
            { host: REDIS_HOST, port: REDIS_PORT },
            // 如有多個主從節點，可一起列出
        ],
        { redisOptions: commonOpts }
    );
} else {
    client = new IORedis(commonOpts);
}

// 監控連線狀態
client.on('connect', () => console.log('🔌 Redis connected'));
client.on('error', err => console.error('❌ Redis error', err));

module.exports = client;
