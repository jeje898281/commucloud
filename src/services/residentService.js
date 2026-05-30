// src/services/residentService.js
const { getAllWithCommunity } = require('../models/residentModel');

async function listResidents() {
    return getAllWithCommunity();
}

module.exports = { listResidents };
