// src/services/adminUserService.js
const bcrypt = require('bcrypt');
const {
    findByUsername, listByCommunity, findById,
    createSubAccount, updateAdminUser, countActiveAdmins
} = require('../models/adminUserModel');
const {
    MissingRequiredFieldsError, UsernameTakenError, PasswordTooShortError,
    RoleInvalidError, UserNotFoundError, TargetUserNotInCommunityError,
    CannotModifySelfError, LastAdminProtectedError
} = require('../errors');

const ALLOWED_NEW_SUB_ROLES = ['manager', 'meeting_assistant'];
const ALL_ROLES = ['admin', 'manager', 'meeting_assistant'];

async function list(communityId) {
    return listByCommunity(communityId);
}

async function create(communityId, { username, password, displayName, role }) {
    if (!username || !password || !displayName || !role) throw new MissingRequiredFieldsError();
    if (password.length < 8) throw new PasswordTooShortError();
    if (!ALLOWED_NEW_SUB_ROLES.includes(role)) throw new RoleInvalidError();
    const existing = await findByUsername(username);
    if (existing) throw new UsernameTakenError();
    const passwordHash = await bcrypt.hash(password, 10);
    return createSubAccount({ communityId, username, passwordHash, displayName, role });
}

async function assertTargetInCommunity(targetId, actorCommunityId) {
    const target = await findById(targetId);
    if (!target) throw new UserNotFoundError();
    if (target.communityId !== actorCommunityId) throw new TargetUserNotInCommunityError();
    return target;
}

async function update(actor, targetId, patch) {
    if (actor.userId === targetId) throw new CannotModifySelfError();
    const target = await assertTargetInCommunity(targetId, actor.communityId);

    const data = {};
    if (patch.displayName !== undefined) {
        if (!patch.displayName) throw new MissingRequiredFieldsError();
        data.displayName = patch.displayName;
    }
    if (patch.role !== undefined) {
        if (!ALL_ROLES.includes(patch.role)) throw new RoleInvalidError();
        if (target.role === 'admin' && patch.role !== 'admin') {
            const activeAdmins = await countActiveAdmins(actor.communityId);
            if (activeAdmins <= 1) throw new LastAdminProtectedError();
        }
        data.role = patch.role;
    }
    if (patch.isActive !== undefined) {
        if (target.role === 'admin' && patch.isActive === false) {
            const activeAdmins = await countActiveAdmins(actor.communityId);
            if (activeAdmins <= 1) throw new LastAdminProtectedError();
        }
        data.isActive = !!patch.isActive;
    }
    if (patch.password !== undefined) {
        if (patch.password.length < 8) throw new PasswordTooShortError();
        data.password = await bcrypt.hash(patch.password, 10);
    }

    if (Object.keys(data).length === 0) throw new MissingRequiredFieldsError();
    return updateAdminUser(targetId, data);
}

async function deactivate(actor, targetId) {
    return update(actor, targetId, { isActive: false });
}

module.exports = { list, create, update, deactivate };
