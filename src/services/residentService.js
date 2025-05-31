// src/services/residentService.js
const { getAllWithCommunity, createResidentModel } = require('../models/residentModel');
const { cacheGet, cacheSet, cacheDel } = require('./cacheService');

const CACHE_FEATURE = 'residentList';
const CACHE_TTL = 6000; // 快取 6000 秒

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

async function createResident(code, residentSqm, email = null, communityId) {
    const createdResidentResult = await createResidentModel(code, residentSqm, email, communityId);
    // 清除快取
    if (createdResidentResult) {
        await cacheDel(CACHE_FEATURE, 'all');
    }
    return createdResidentResult;
}

module.exports = { listResidents, createResident };
