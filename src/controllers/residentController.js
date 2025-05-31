// src/controllers/residentController.js
const { listResidents, createResident } = require('../services/residentService');

async function getResidents(req, res) {
    try {
        const { fromCache, data } = await listResidents();
        res.status(200).json({
            success: true,
            fromCache,
            data
        });
    } catch (err) {
        console.error('getResidents error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

async function handleCreateResident(req, res) {
    try {
        const { code, residentSqm, email } = req.body;
        const { communityId } = req.user;
        const resident = await createResident(code, residentSqm, email, communityId);
        res.status(201).json({ success: true, data: resident });
    } catch (error) {
        // 如果是 Prisma P2002 錯誤 (email 重複)
        if (error.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('code')) {
            return res.status(400).json({
                success: false,
                errorCode: 'CODE_ALREADY_EXISTS',
                message: '此住戶戶號已被使用，請更換其他戶號。',
            });
        }
        // 其他錯誤則回傳 500
        console.error('createResidentModel error:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: '伺服器內部錯誤，請稍後再試。',
        });
    }
}

module.exports = { getResidents, handleCreateResident };
