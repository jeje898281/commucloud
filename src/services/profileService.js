const bcrypt = require('bcrypt');
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

/**
 * 修改密碼
 * @param {number} userId 用戶ID
 * @param {string} currentPassword 目前密碼
 * @param {string} newPassword 新密碼
 * @returns {Promise<Object>}
 */
async function changePassword(userId, currentPassword, newPassword) {
    // 獲取用戶資訊（包含加密的密碼）
    const user = await findById(userId);
    if (!user) {
        throw new Error('用戶不存在');
    }

    // 驗證目前密碼
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new Error('目前密碼不正確');
    }

    // 驗證新密碼格式（簡化規則：只要英數超過6個字元）
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
        throw new Error('新密碼長度至少6個字元');
    }

    if (newPassword.length > 100) {
        throw new Error('新密碼長度不能超過100個字元');
    }

    // 檢查是否包含英文字母和數字
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasLetters || !hasNumbers) {
        throw new Error('新密碼必須包含英文字母和數字');
    }

    // 檢查新密碼是否與目前密碼相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new Error('新密碼不能與目前密碼相同');
    }

    // 加密新密碼
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密碼
    await updateProfile(userId, { password: hashedNewPassword });

    return { message: '密碼修改成功' };
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword
}; 