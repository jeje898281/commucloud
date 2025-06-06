const { getUserProfile, updateUserProfile } = require('../services/profileService');

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

        // 根據錯誤類型回傳不同的狀態碼
        if (error.message.includes('不存在')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('不能為空') ||
            error.message.includes('長度') ||
            error.message.includes('沒有要更新的欄位')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: '更新資料失敗，請稍後再試'
        });
    }
}

module.exports = {
    handleGetProfile,
    handleUpdateProfile
}; 