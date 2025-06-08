// src/services/profileService.js
const bcrypt = require('bcrypt');
const { getProfile, updateProfile, findById } = require('../models/adminUserModel');
const {
    UserNotFoundError, DisplayNameEmptyError, DisplayNameTooLongError,
    NoUpdateFieldsError, WrongPasswordError, PasswordTooShortError,
    PasswordTooLongError, PasswordInvalidFormatError, PasswordSameAsCurrentError
} = require('../errors');

async function getUserProfile(userId) {
    const profile = await getProfile(userId);
    if (!profile) {
        throw new UserNotFoundError();
    }
    return profile;
}

async function updateUserProfile(userId, updateData) {
    const existingUser = await findById(userId);
    if (!existingUser) {
        throw new UserNotFoundError();
    }

    const allowedFields = ['displayName'];
    const filteredData = {};

    if (updateData.displayName !== undefined) {
        if (typeof updateData.displayName !== 'string' || updateData.displayName.trim().length === 0) {
            throw new DisplayNameEmptyError();
        }
        if (updateData.displayName.trim().length > 50) {
            throw new DisplayNameTooLongError();
        }
        filteredData.displayName = updateData.displayName.trim();
    }

    if (Object.keys(filteredData).length === 0) {
        throw new NoUpdateFieldsError();
    }

    const updatedProfile = await updateProfile(userId, filteredData);
    return updatedProfile;
}


async function changePassword(userId, currentPassword, newPassword) {
    const user = await findById(userId);
    if (!user) {
        throw new UserNotFoundError();
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new WrongPasswordError();
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
        throw new PasswordTooShortError();
    }

    if (newPassword.length > 100) {
        throw new PasswordTooLongError();
    }

    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasLetters || !hasNumbers) {
        throw new PasswordInvalidFormatError();
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new PasswordSameAsCurrentError();
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    const updatedUser = await updateProfile(userId, { password: hashedNewPassword });
    return updatedUser;
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword
}; 