// src/controllers/communityController.js
const { getCommunityInfo, updateCommunityInfo } = require('../services/communityService');

async function handleGetCommunity(req, res) {
    const userId = req.user.userId;
    const communityInfo = await getCommunityInfo(userId);
    res.status(200).json({ data: communityInfo });
}

async function handleUpdateCommunity(req, res) {
    const userId = req.user.userId;
    const updateData = req.body;

    const updatedCommunity = await updateCommunityInfo(userId, updateData);

    res.status(200).json({ data: updatedCommunity });
}

module.exports = {
    handleGetCommunity,
    handleUpdateCommunity
}; 