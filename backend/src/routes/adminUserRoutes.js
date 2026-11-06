// src/routes/adminUserRoutes.js
const router = require('express').Router();
const requireRole = require('../middleware/requireRole');
const {
    handleList, handleCreate, handleUpdate, handleDeactivate
} = require('../controllers/adminUserController');

router.use(requireRole('admin'));
router.get('/users', handleList);
router.post('/users', handleCreate);
router.patch('/users/:id', handleUpdate);
router.delete('/users/:id', handleDeactivate);

module.exports = router;
