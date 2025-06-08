// src/services/residentService.js
const { getAllWithCommunity, createResidentModel, bulkCreateResidents, updateResidentModel, deleteResidentModel } = require('../models/residentModel');
const { cacheGet, cacheSet, cacheDel } = require('./cacheService');
const { ResidentCodeAlreadyExistsError, ResidentNotFoundError, ResidentHasCheckinDataError } = require('../errors');

const CACHE_FEATURE = 'residentList';
const CACHE_TTL = 6000;

async function listResidents() {
    const cached = await cacheGet(CACHE_FEATURE, 'all');
    if (cached) {
        return { fromCache: true, data: cached };
    }
    const residents = await getAllWithCommunity();
    await cacheSet(CACHE_FEATURE, 'all', residents, CACHE_TTL);
    return { fromCache: false, data: residents };
}

async function createResident(code, residentSqm, email = null, communityId) {
    const createdResidentResult = await createResidentModel(code, residentSqm, email, communityId);
    if (createdResidentResult) {
        await cacheDel(CACHE_FEATURE, 'all');
    }
    return createdResidentResult;
}


function validateBulkResidentsData(residents) {
    const invalidRows = [];
    const validResidents = [];

    for (let i = 0; i < residents.length; i++) {
        const resident = residents[i];
        const errors = [];

        // 驗證戶號
        if (!resident.code || typeof resident.code !== 'string' || resident.code.trim() === '') {
            errors.push('code is required');
        }

        // 驗證坪數
        if (resident.residentSqm === undefined || resident.residentSqm === null) {
            errors.push('residentSqm is required');
        } else if (typeof resident.residentSqm !== 'number' || isNaN(resident.residentSqm) || resident.residentSqm <= 0) {
            errors.push('residentSqm must be a number and greater than 0');
        }

        // 驗證電子信箱（選填）
        if (resident.email && typeof resident.email === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(resident.email)) {
                errors.push('email must be a valid email address');
            }
        }

        if (errors.length > 0) {
            invalidRows.push({
                index: i + 1,
                data: resident,
                errors
            });
        } else {
            validResidents.push({
                code: resident.code.trim().toUpperCase(),
                residentSqm: resident.residentSqm,
                email: resident.email || null
            });
        }
    }

    return { invalidRows, validResidents };
}

async function bulkCreateResident(residents, communityId) {
    const { invalidRows, validResidents } = validateBulkResidentsData(residents);

    if (invalidRows.length > 0) {
        return {
            success: false,
            type: 'VALIDATION_ERROR',
            message: 'some data format is invalid',
            invalidRows
        };
    }

    const residentsWithCommunity = validResidents.map(resident => ({
        ...resident,
        communityId
    }));

    try {
        const result = await bulkCreateResidents(residentsWithCommunity);

        await cacheDel(CACHE_FEATURE, 'all');

        if (result.success) {
            return {
                success: true,
                importedCount: result.count,
                successfulResidents: result.successfulResidents
            };
        } else {
            return {
                success: false,
                type: 'PARTIAL_SUCCESS',
                message: `successfully imported ${result.count} residents, ${result.conflictedCodes.length} residents have duplicate codes`,
                importedCount: result.count,
                conflictedCodes: result.conflictedCodes
            };
        }
    } catch (error) {
        console.error('bulkCreateResident error:', error);
        throw error;
    }
}

async function updateResident(id, data) {
    try {
        const updatedResidentResult = await updateResidentModel(id, data);
        if (updatedResidentResult) {
            await cacheDel(CACHE_FEATURE, 'all');
        }
        return updatedResidentResult;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new ResidentCodeAlreadyExistsError();
        }
        throw error;
    }
}

async function deleteResident(id) {
    try {
        const deletedResidentResult = await deleteResidentModel(id);
        if (deletedResidentResult) {
            await cacheDel(CACHE_FEATURE, 'all');
        }
        return deletedResidentResult;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new ResidentNotFoundError();
        }
        if (error.code === 'P2003') {
            throw new ResidentHasCheckinDataError();
        }
        throw error;
    }
}

module.exports = { listResidents, createResident, bulkCreateResident, updateResident, deleteResident };
