// src/controllers/adminUserController.js
const svc = require('../services/adminUserService');

async function handleList(req, res, next) {
    try {
        const data = await svc.list(req.user.communityId);
        return res.json({ data });
    } catch (err) { return next(err); }
}

async function handleCreate(req, res, next) {
    try {
        const data = await svc.create(req.user.communityId, req.body || {});
        return res.status(201).json({ data });
    } catch (err) { return next(err); }
}

async function handleUpdate(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const data = await svc.update(req.user, id, req.body || {});
        return res.json({ data });
    } catch (err) { return next(err); }
}

async function handleDeactivate(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const data = await svc.deactivate(req.user, id);
        return res.json({ data });
    } catch (err) { return next(err); }
}

module.exports = { handleList, handleCreate, handleUpdate, handleDeactivate };
