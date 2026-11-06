// src/controllers/profileController.js
const { getUserProfile, updateUserProfile, changePassword } = require('../services/profileService');
const { MissingRequiredFieldsError, } = require('../errors');

async function handleGetProfile(req, res) {
    const userId = req.user.userId;
    const profile = await getUserProfile(userId);
    res.status(200).json({ data: profile });
}

async function handleUpdateProfile(req, res) {
    const userId = req.user.userId;
    const updateData = req.body;

    const updatedProfile = await updateUserProfile(userId, updateData);

    res.status(200).json({ data: updatedProfile });
}

async function handleChangePassword(req, res) {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new MissingRequiredFieldsError();
    }
    const result = await changePassword(userId, currentPassword, newPassword);

    res.status(200).json({ message: result.message });
}

module.exports = {
    handleGetProfile,
    handleUpdateProfile,
    handleChangePassword
}; 