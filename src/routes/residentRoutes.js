// src/routes/residentRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getResidents, handleCreateResident } = require('../controllers/residentController');

router.get('/', authMiddleware, getResidents);
router.post('/', authMiddleware, handleCreateResident);

module.exports = router;
