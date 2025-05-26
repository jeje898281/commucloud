// src/services/cacheService.js
const redis = require('../config/redis');
const NAMESPACE = process.env.APP_NAMESPACE;

function makeKey(feature, identifier) {
    return `${NAMESPACE}:${feature}:${identifier}`;
}

async function cacheSet(feature, identifier, value, ttlSeconds = 300) {
    const key = makeKey(feature, identifier);
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function cacheGet(feature, identifier) {
    const key = makeKey(feature, identifier);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
}

async function cacheDel(feature, identifier) {
    const key = makeKey(feature, identifier);
    await redis.del(key);
}

module.exports = { cacheSet, cacheGet, cacheDel };
