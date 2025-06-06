const { getProfile, updateProfile, findById } = require('../models/adminUserModel');

/**
 * 獲取用戶資料
 * @param {number} userId 用戶ID
 * @returns {Promise<Object>}
 */
async function getUserProfile(userId) {
    const profile = await getProfile(userId);
    if (!profile) {
        throw new Error('用戶不存在');
    }
    return profile;
}

/**
 * 更新用戶資料
 * @param {number} userId 用戶ID
 * @param {Object} updateData 更新資料
 * @returns {Promise<Object>}
 */
async function updateUserProfile(userId, updateData) {
    // 檢查用戶是否存在
    const existingUser = await findById(userId);
    if (!existingUser) {
        throw new Error('用戶不存在');
    }

    // 驗證和過濾允許更新的欄位
    const allowedFields = ['displayName'];
    const filteredData = {};

    // 只允許更新displayName欄位（用戶名不允許修改）
    if (updateData.displayName !== undefined) {
        if (typeof updateData.displayName !== 'string' || updateData.displayName.trim().length === 0) {
            throw new Error('顯示名稱不能為空');
        }
        if (updateData.displayName.trim().length > 50) {
            throw new Error('顯示名稱長度不能超過50個字元');
        }
        filteredData.displayName = updateData.displayName.trim();
    }

    // 如果沒有要更新的欄位
    if (Object.keys(filteredData).length === 0) {
        throw new Error('沒有要更新的欄位');
    }

    // 執行更新
    const updatedProfile = await updateProfile(userId, filteredData);
    return updatedProfile;
}

module.exports = {
    getUserProfile,
    updateUserProfile
}; 