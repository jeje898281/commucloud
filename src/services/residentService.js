// src/services/residentService.js
const { getAllWithCommunity } = require('../models/residentModel');
const { cacheGet, cacheSet } = require('./cacheService');

const CACHE_FEATURE = 'residentList';
const CACHE_TTL = 60; // 快取 60 秒

async function listResidents() {
    // 1. 嘗試從 Redis 拿
    const cached = await cacheGet(CACHE_FEATURE, 'all');
    if (cached) {
        return { fromCache: true, data: cached };
    }

    // 2. 不在快取 → 拿資料庫
    const residents = await getAllWithCommunity();

    // 3. 寫入快取
    await cacheSet(CACHE_FEATURE, 'all', residents, CACHE_TTL);

    // 4. 回傳
    return { fromCache: false, data: residents };
}

module.exports = { listResidents };
