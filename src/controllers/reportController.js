// src/controllers/reportController.js
const { checkin } = require('../services/reportService');

/**
 * POST /api/checkin
 * @summary 住戶報到
 * @description 
 *   - 由管理者或掃碼頁呼叫
 *   - 註冊覺得簡單的功能描述  
 * body: { meetingId, residentId, isManual }
 * header: Authorization: Bearer <token>
 * @param {number} meetingId   - 會議 ID
 * @param {number} residentId - 住戶 ID
 * @param {boolean} isManual - 是否為手動報到
 * @security BearerAuth
 * @response 201 - 新增報到紀錄
 * @response 400 - 報到失敗
 * @response 409 - 已報到過
 */
async function handleCheckin(req, res) {
    try {
        // 從 body 拿參數
        const { meetingId, residentId, isManual = false } = req.body;
        // 從 middleware 得到的 user.id
        const userId = req.user.userId;

        // 呼叫 Service
        const record = await checkin({ meetingId, residentId, userId, isManual });

        res.status(201).json({
            success: true,
            data: record
        });
    } catch (err) {
        if (err.code === 'ALREADY_CHECKED_IN') {
            return res.status(409).json({ success: false, error: err.message });
        }
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
}

module.exports = { handleCheckin };
