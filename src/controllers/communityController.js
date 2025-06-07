const { getCommunityInfo, updateCommunityInfo } = require('../services/communityService');

async function handleGetCommunity(req, res) {
    try {
        const userId = req.user.userId;
        const communityInfo = await getCommunityInfo(userId);

        res.json({
            success: true,
            data: communityInfo
        });
    } catch (error) {
        console.error('handleGetCommunity error:', error);

        if (error.message.includes('不存在')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false
        });
    }
}

/**
 * 更新社區資訊
 */
async function handleUpdateCommunity(req, res) {
    try {
        const userId = req.user.userId;
        const updateData = req.body;

        const updatedCommunity = await updateCommunityInfo(userId, updateData);

        res.json({
            success: true,
            data: updatedCommunity,
            message: '社區資訊更新成功'
        });
    } catch (error) {
        console.error('handleUpdateCommunity error:', error);

        // 根據錯誤類型回傳不同的狀態碼
        if (error.message.includes('不存在')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('沒有權限')) {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('不能為空') ||
            error.message.includes('長度') ||
            error.message.includes('格式') ||
            error.message.includes('沒有要更新的欄位')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: '更新社區資訊失敗，請稍後再試'
        });
    }
}

module.exports = {
    handleGetCommunity,
    handleUpdateCommunity
}; 