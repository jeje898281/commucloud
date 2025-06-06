const { findById, getCommunityStats, updateCommunity } = require('../models/communityModel');
const { findById: findAdminById } = require('../models/adminUserModel');

/**
 * 獲取社區資訊和統計資料
 * @param {number} userId 管理員用戶ID
 * @returns {Promise<Object>}
 */
async function getCommunityInfo(userId) {
    // 獲取管理員資訊以確定所屬社區
    const admin = await findAdminById(userId);
    if (!admin) {
        throw new Error('用戶不存在');
    }

    // 獲取社區基本資訊
    const community = await findById(admin.communityId);
    if (!community) {
        throw new Error('社區不存在');
    }

    // 獲取社區統計資料
    const stats = await getCommunityStats(admin.communityId);

    return {
        ...community,
        stats
    };
}

/**
 * 更新社區資訊
 * @param {number} userId 管理員用戶ID
 * @param {Object} updateData 更新資料
 * @returns {Promise<Object>}
 */
async function updateCommunityInfo(userId, updateData) {
    // 獲取管理員資訊
    const admin = await findAdminById(userId);
    if (!admin) {
        throw new Error('用戶不存在');
    }

    // 檢查權限（只有admin角色可以編輯社區資訊）
    if (admin.role !== 'admin') {
        throw new Error('沒有權限編輯社區資訊');
    }

    // 驗證和過濾允許更新的欄位
    const allowedFields = ['name', 'description', 'logoUrl'];
    const filteredData = {};

    if (updateData.name !== undefined) {
        if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
            throw new Error('社區名稱不能為空');
        }
        if (updateData.name.trim().length > 100) {
            throw new Error('社區名稱長度不能超過100個字元');
        }
        filteredData.name = updateData.name.trim();
    }

    if (updateData.description !== undefined) {
        if (typeof updateData.description !== 'string') {
            throw new Error('社區描述格式不正確');
        }
        if (updateData.description.trim().length > 500) {
            throw new Error('社區描述長度不能超過500個字元');
        }
        filteredData.description = updateData.description.trim();
    }

    if (updateData.logoUrl !== undefined) {
        if (typeof updateData.logoUrl !== 'string') {
            throw new Error('Logo URL格式不正確');
        }
        if (updateData.logoUrl.trim().length > 255) {
            throw new Error('Logo URL長度不能超過255個字元');
        }
        filteredData.logoUrl = updateData.logoUrl.trim();
    }

    // 如果沒有要更新的欄位
    if (Object.keys(filteredData).length === 0) {
        throw new Error('沒有要更新的欄位');
    }

    // 執行更新
    const updatedCommunity = await updateCommunity(admin.communityId, filteredData);

    // 獲取更新後的統計資料
    const stats = await getCommunityStats(admin.communityId);

    return {
        ...updatedCommunity,
        stats
    };
}

module.exports = {
    getCommunityInfo,
    updateCommunityInfo
}; 