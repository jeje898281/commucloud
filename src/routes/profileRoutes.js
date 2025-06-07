const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    handleGetProfile,
    handleUpdateProfile,
    handleChangePassword
} = require('../controllers/profileController');

// 獲取目前用戶資料
router.get('/profile', authMiddleware, handleGetProfile);

// 更新目前用戶資料
router.put('/profile', authMiddleware, handleUpdateProfile);

// 修改密碼
router.put('/profile/password', authMiddleware, handleChangePassword);

module.exports = router; 