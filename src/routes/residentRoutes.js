// src/routes/residentRoutes.js
const router = require('express').Router();
const {
    getResidents, handleCreateResident, handleBulkImportResident,
    handleUpdateResident, handleDeleteResident
} = require('../controllers/residentController');

router.get('/', getResidents);
router.post('/', handleCreateResident);
router.post('/bulk', handleBulkImportResident);
router.patch('/', handleUpdateResident);
router.delete('/', handleDeleteResident);

module.exports = router;
