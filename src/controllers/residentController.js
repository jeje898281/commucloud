// src/controllers/residentController.js
const { listResidents, createResident, bulkCreateResident, updateResident, deleteResident } = require('../services/residentService');

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

async function handleBulkImportResident(req, res) {
    try {
        const { residents } = req.body;
        const { communityId } = req.user;

        // 基本驗證
        if (!Array.isArray(residents) || residents.length === 0) {
            return res.status(400).json({
                success: false,
                message: '請提供有效的住戶資料陣列'
            });
        }

        // 調用服務層處理批量創建
        const result = await bulkCreateResident(residents, communityId);

        if (result.success) {
            return res.status(200).json({
                success: true,
                importedCount: result.importedCount
            });
        } else if (result.type === 'VALIDATION_ERROR') {
            return res.status(400).json({
                success: false,
                message: result.message,
                invalidRows: result.invalidRows
            });
        } else if (result.type === 'PARTIAL_SUCCESS') {
            return res.status(207).json({
                success: false,
                message: result.message,
                importedCount: result.importedCount,
                conflictedCodes: result.conflictedCodes
            });
        }

    } catch (error) {
        console.error('handleBulkImportResident error:', error);
        return res.status(500).json({
            success: false,
            message: '伺服器內部錯誤，請稍後再試'
        });
    }
}

async function handleUpdateResident(req, res) {
    try {
        const { id, ...data } = req.body;
        const resident = await updateResident(id, data);
        res.status(200).json({ success: true, data: resident });
    } catch (error) {
        console.error('handleUpdateResident error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: '此住戶戶號已被使用，請更換其他戶號。',
                errorCode: 'CODE_ALREADY_EXISTS'
            });
        }
        return res.status(500).json({
            success: false,
            message: '伺服器內部錯誤，請稍後再試'
        });
    }
}

async function handleDeleteResident(req, res) {
    try {
        const { id } = req.body;
        const resident = await deleteResident(id);
        res.status(200).json({ success: true, data: resident });
    } catch (error) {
        console.error('handleDeleteResident error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: '住戶不存在',
                errorCode: 'RESIDENT_NOT_FOUND'
            });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({
                success: false,
                message: '此住戶已有簽到資料，無法刪除',
                errorCode: 'RESIDENT_HAS_CHECKIN_DATA'
            });
        }
        return res.status(500).json({
            success: false,
            message: '伺服器內部錯誤，請稍後再試'
        });
    }
}

module.exports = { getResidents, handleCreateResident, handleBulkImportResident, handleUpdateResident, handleDeleteResident };
