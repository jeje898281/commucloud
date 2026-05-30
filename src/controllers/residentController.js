// src/controllers/residentController.js
const { listResidents } = require('../services/residentService');

async function getResidents(req, res) {
    try {
        const data = await listResidents();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { getResidents };
