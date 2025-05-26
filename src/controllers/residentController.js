// src/controllers/residentController.js
const { listResidents } = require('../services/residentService');

async function getResidents(req, res) {
    try {
        const { fromCache, data } = await listResidents();
        res.status(200).json({
            success: true,
            fromCache,
            data
        });
    } catch (err) {
        console.error('getResidents error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

module.exports = { getResidents };
