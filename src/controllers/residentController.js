// src/controllers/residentController.js
const { listResidents, createResident, bulkCreateResident, updateResident, deleteResident } = require('../services/residentService');
const { MissingRequiredFieldsError } = require('../errors');

async function getResidents(req, res) {
    const { fromCache, data } = await listResidents();
    res.status(200).json({ fromCache, data });
}

async function handleCreateResident(req, res) {
    const { code, residentSqm, email } = req.body;
    const { communityId } = req.user;
    const resident = await createResident(code, residentSqm, email, communityId);
    res.status(201).json({ data: resident });
}

async function handleBulkImportResident(req, res) {
    const { residents } = req.body;
    const { communityId } = req.user;

    if (!Array.isArray(residents) || residents.length === 0) {
        throw new MissingRequiredFieldsError();
    }

    const result = await bulkCreateResident(residents, communityId);

    if (result.success) {
        res.status(200).json({ importedCount: result.importedCount });
    } else if (result.type === 'VALIDATION_ERROR') {
        res.status(400).json({
            message: result.message,
            invalidRows: result.invalidRows,
        });
    } else if (result.type === 'PARTIAL_SUCCESS') {
        res.status(207).json({
            message: result.message,
            importedCount: result.importedCount,
            conflictedCodes: result.conflictedCodes,
        });
    }
}

async function handleUpdateResident(req, res) {
    const { id, ...data } = req.body;
    const resident = await updateResident(id, data);
    res.status(200).json({ data: resident });
}

async function handleDeleteResident(req, res) {
    const { id } = req.body;
    const resident = await deleteResident(id);
    res.status(200).json({ data: resident });
}

module.exports = { getResidents, handleCreateResident, handleBulkImportResident, handleUpdateResident, handleDeleteResident };
