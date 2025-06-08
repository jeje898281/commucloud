// src/routes/communityRoutes.js
const router = require('express').Router();
const { handleGetCommunity, handleUpdateCommunity } = require('../controllers/communityController');

router.get('/community', handleGetCommunity);
router.put('/community', handleUpdateCommunity);

module.exports = router; 