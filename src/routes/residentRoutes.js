// src/routes/residentRoutes.js
const router = require('express').Router();
const {
    getResidents, handleCreateResident, handleBulkImportResident,
    handleUpdateResident, handleDeleteResident
} = require('../controllers/residentController');
const requireRole = require('../middleware/requireRole');

router.get('/', getResidents);
router.post('/', requireRole('admin', 'manager'), handleCreateResident);
router.post('/bulk', requireRole('admin', 'manager'), handleBulkImportResident);
router.patch('/', requireRole('admin', 'manager'), handleUpdateResident);
router.delete('/', requireRole('admin', 'manager'), handleDeleteResident);

module.exports = router;
