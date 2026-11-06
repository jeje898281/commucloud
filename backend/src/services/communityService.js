// src/services/communityService.js
const { findById, getCommunityStats, updateCommunity } = require('../models/communityModel');
const { findById: findAdminById } = require('../models/adminUserModel');
const { UserNotFoundError, CommunityNotFoundError,
    CommunityNameEmptyError, CommunityNameTooLongError,
    CommunityDescriptionEmptyError, CommunityDescriptionTooLongError,
    CommunityLogoUrlEmptyError, CommunityLogoUrlTooLongError,
    NoUpdateFieldsError
} = require('../errors');

async function getCommunityInfo(userId) {
    const admin = await findAdminById(userId);
    if (!admin) {
        throw new UserNotFoundError();
    }

    const community = await findById(admin.communityId);
    if (!community) {
        throw new CommunityNotFoundError();
    }

    const stats = await getCommunityStats(admin.communityId);

    return {
        ...community,
        stats
    };
}

async function updateCommunityInfo(userId, updateData) {
    const admin = await findAdminById(userId);
    if (!admin) throw new UserNotFoundError();

    if (admin.role !== 'admin') throw new UnauthorizedError();

    const filteredData = {};

    if (updateData.name !== undefined) {
        if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
            throw new CommunityNameEmptyError();
        }
        if (updateData.name.trim().length > 100) {
            throw new CommunityNameTooLongError();
        }
        filteredData.name = updateData.name.trim();
    }

    if (updateData.description !== undefined) {
        if (typeof updateData.description !== 'string') {
            throw new CommunityDescriptionEmptyError();
        }
        if (updateData.description.trim().length > 500) {
            throw new CommunityDescriptionTooLongError();
        }
        filteredData.description = updateData.description.trim();
    }

    if (updateData.logoUrl !== undefined) {
        if (typeof updateData.logoUrl !== 'string') {
            throw new CommunityLogoUrlEmptyError();
        }
        if (updateData.logoUrl.trim().length > 255) {
            throw new CommunityLogoUrlTooLongError();
        }
        filteredData.logoUrl = updateData.logoUrl.trim();
    }

    if (Object.keys(filteredData).length === 0) {
        throw new NoUpdateFieldsError();
    }

    const updatedCommunity = await updateCommunity(admin.communityId, filteredData);

    const stats = await getCommunityStats(admin.communityId);

    return {
        ...updatedCommunity,
        stats
    };
}

module.exports = {
    getCommunityInfo,
    updateCommunityInfo
}; 