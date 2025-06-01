// src/routes/residentRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getResidents, handleCreateResident, handleBulkImportResident,
    handleUpdateResident, handleDeleteResident
} = require('../controllers/residentController');

router.get('/', authMiddleware, getResidents);
router.post('/', authMiddleware, handleCreateResident);
router.post('/bulk', authMiddleware, handleBulkImportResident);
router.patch('/', authMiddleware, handleUpdateResident);
router.delete('/', authMiddleware, handleDeleteResident);

module.exports = router;
