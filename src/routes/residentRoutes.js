// src/routes/residentRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getResidents } = require('../controllers/residentController');

router.get('/', authMiddleware, getResidents);

module.exports = router;
