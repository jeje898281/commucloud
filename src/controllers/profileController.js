const { getUserProfile, updateUserProfile, changePassword } = require('../services/profileService');

/**
 * 獲取目前用戶資料
 */
async function handleGetProfile(req, res) {
    try {
        const userId = req.user.userId;
        const profile = await getUserProfile(userId);

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('handleGetProfile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '獲取用戶資料失敗'
        });
    }
}

/**
 * 更新目前用戶資料
 */
async function handleUpdateProfile(req, res) {
    try {
        const userId = req.user.userId;
        const updateData = req.body;

        const updatedProfile = await updateUserProfile(userId, updateData);

        res.json({
            success: true,
            data: updatedProfile,
            message: '資料更新成功'
        });
    } catch (error) {
        console.error('handleUpdateProfile error:', error);

        // 根據錯誤類型回傳不同的狀態碼和錯誤代碼
        if (error.message.includes('不存在')) {
            return res.status(404).json({
                success: false,
                errorCode: 'USER_NOT_FOUND',
                message: '用戶不存在'
            });
        }

        if (error.message.includes('不能為空')) {
            return res.status(400).json({
                success: false,
                errorCode: 'DISPLAY_NAME_REQUIRED',
                message: '顯示名稱不能為空'
            });
        }

        if (error.message.includes('長度')) {
            return res.status(400).json({
                success: false,
                errorCode: 'DISPLAY_NAME_TOO_LONG',
                message: '顯示名稱長度不能超過50個字元'
            });
        }

        if (error.message.includes('沒有要更新的欄位')) {
            return res.status(400).json({
                success: false,
                errorCode: 'NO_FIELDS_TO_UPDATE',
                message: '沒有要更新的欄位'
            });
        }

        res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: '更新資料失敗，請稍後再試'
        });
    }
}

/**
 * 修改密碼
 */
async function handleChangePassword(req, res) {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // 基本驗證
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                errorCode: 'MISSING_REQUIRED_FIELDS',
                message: '請提供目前密碼和新密碼'
            });
        }

        const result = await changePassword(userId, currentPassword, newPassword);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('handleChangePassword error:', error);

        // 根據錯誤類型回傳不同的狀態碼和錯誤代碼
        if (error.message.includes('不存在')) {
            return res.status(404).json({
                success: false,
                errorCode: 'USER_NOT_FOUND',
                message: '用戶不存在'
            });
        }

        if (error.message.includes('目前密碼不正確')) {
            return res.status(401).json({
                success: false,
                errorCode: 'INVALID_CURRENT_PASSWORD',
                message: '目前密碼不正確'
            });
        }

        if (error.message.includes('長度至少6個字元')) {
            return res.status(400).json({
                success: false,
                errorCode: 'PASSWORD_TOO_SHORT',
                message: '新密碼長度至少6個字元'
            });
        }

        if (error.message.includes('長度不能超過100個字元')) {
            return res.status(400).json({
                success: false,
                errorCode: 'PASSWORD_TOO_LONG',
                message: '新密碼長度不能超過100個字元'
            });
        }

        if (error.message.includes('必須包含英文字母和數字')) {
            return res.status(400).json({
                success: false,
                errorCode: 'PASSWORD_INVALID_FORMAT',
                message: '新密碼必須包含英文字母和數字'
            });
        }

        if (error.message.includes('不能與目前密碼相同')) {
            return res.status(400).json({
                success: false,
                errorCode: 'PASSWORD_SAME_AS_CURRENT',
                message: '新密碼不能與目前密碼相同'
            });
        }

        res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: '修改密碼失敗，請稍後再試'
        });
    }
}

module.exports = {
    handleGetProfile,
    handleUpdateProfile,
    handleChangePassword
}; 