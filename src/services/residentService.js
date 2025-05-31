// src/services/residentService.js
const { getAllWithCommunity, createResidentModel, bulkCreateResidents } = require('../models/residentModel');
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

/**
 * 驗證批量住戶資料格式
 * @param {Array} residents - 住戶資料陣列
 * @returns {Object} - 驗證結果
 */
function validateBulkResidentsData(residents) {
    const invalidRows = [];
    const validResidents = [];

    for (let i = 0; i < residents.length; i++) {
        const resident = residents[i];
        const errors = [];

        // 驗證戶號
        if (!resident.code || typeof resident.code !== 'string' || resident.code.trim() === '') {
            errors.push('戶號不能為空');
        }

        // 驗證坪數
        if (resident.residentSqm === undefined || resident.residentSqm === null) {
            errors.push('坪數不能為空');
        } else if (typeof resident.residentSqm !== 'number' || isNaN(resident.residentSqm) || resident.residentSqm <= 0) {
            errors.push('坪數格式錯誤');
        }

        // 驗證電子信箱（選填）
        if (resident.email && typeof resident.email === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(resident.email)) {
                errors.push('電子信箱格式錯誤');
            }
        }

        if (errors.length > 0) {
            invalidRows.push({
                index: i + 1,
                data: resident,
                errors
            });
        } else {
            validResidents.push({
                code: resident.code.trim().toUpperCase(),
                residentSqm: resident.residentSqm,
                email: resident.email || null
            });
        }
    }

    return { invalidRows, validResidents };
}

/**
 * 批量創建住戶
 * @param {Array} residents - 住戶資料陣列
 * @param {number} communityId - 社區ID
 * @returns {Promise<Object>} - 創建結果
 */
async function bulkCreateResident(residents, communityId) {
    // 驗證資料格式
    const { invalidRows, validResidents } = validateBulkResidentsData(residents);

    if (invalidRows.length > 0) {
        return {
            success: false,
            type: 'VALIDATION_ERROR',
            message: '部分資料格式錯誤',
            invalidRows
        };
    }

    // 為每個住戶添加 communityId
    const residentsWithCommunity = validResidents.map(resident => ({
        ...resident,
        communityId
    }));

    try {
        // 批量創建住戶
        const result = await bulkCreateResidents(residentsWithCommunity);

        // 清除快取
        await cacheDel(CACHE_FEATURE, 'all');

        if (result.success) {
            return {
                success: true,
                importedCount: result.count,
                successfulResidents: result.successfulResidents
            };
        } else {
            // 處理重複戶號的情況
            return {
                success: false,
                type: 'PARTIAL_SUCCESS',
                message: `成功匯入 ${result.count} 筆，${result.conflictedCodes.length} 筆戶號重複`,
                importedCount: result.count,
                conflictedCodes: result.conflictedCodes
            };
        }
    } catch (error) {
        console.error('bulkCreateResident error:', error);
        throw error;
    }
}

module.exports = { listResidents, createResident, bulkCreateResident };
