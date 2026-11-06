// src/routes/profileRoutes.js
const router = require('express').Router();
const {
    handleGetProfile,
    handleUpdateProfile,
    handleChangePassword
} = require('../controllers/profileController');

router.get('/profile', handleGetProfile);
router.put('/profile', handleUpdateProfile);
router.put('/profile/password', handleChangePassword);

module.exports = router; 