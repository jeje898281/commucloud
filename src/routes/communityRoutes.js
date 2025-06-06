const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    handleGetCommunity,
    handleUpdateCommunity
} = require('../controllers/communityController');

// 獲取社區資訊
router.get('/community', authMiddleware, handleGetCommunity);

// 更新社區資訊 (只有admin可以)
router.put('/community', authMiddleware, handleUpdateCommunity);

module.exports = router; 