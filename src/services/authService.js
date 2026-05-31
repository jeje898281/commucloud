// src/services/authService.js
const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');
const { findByUsername } = require('../models/adminUserModel');
const { UserNotFoundError, WrongPasswordError } = require('../errors');

async function login({ username, password }) {
    const user = await findByUsername(username);
    if (!user) throw new UserNotFoundError();
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new WrongPasswordError();
    if (!user.isActive) {
        const { AccountDeactivatedError } = require('../errors');
        throw new AccountDeactivatedError();
    }
    const token = signToken({ userId: user.id, role: user.role, communityId: user.community.id });
    return {
        token,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        community: {
            id: user.community.id,
            name: user.community.name,
            description: user.community.description
        }
    };
}

const {
    UsernameTakenError, EmailTakenError, MissingRequiredFieldsError,
    PasswordTooShortError, CommunityNameEmptyError
} = require('../errors');
const { findByEmail, createAdminAndCommunity } = require('../models/adminUserModel');

async function register({ username, email, password, displayName, communityName, communityDescription, logoUrl }) {
    if (!username || !email || !password || !displayName || !communityName) {
        throw new MissingRequiredFieldsError();
    }
    if (password.length < 8) throw new PasswordTooShortError();
    if (!communityName.trim()) throw new CommunityNameEmptyError();

    const existingByUsername = await findByUsername(username);
    if (existingByUsername) throw new UsernameTakenError();

    const existingByEmail = await findByEmail(email);
    if (existingByEmail) throw new EmailTakenError();

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await createAdminAndCommunity({
        username, email, passwordHash, displayName,
        communityName, communityDescription: communityDescription || '', logoUrl: logoUrl || ''
    });

    const token = signToken({ userId: admin.id, role: admin.role, communityId: admin.community.id });
    return {
        token,
        username: admin.username,
        displayName: admin.displayName,
        role: admin.role,
        community: {
            id: admin.community.id,
            name: admin.community.name,
            description: admin.community.description
        }
    };
}

async function demoLogin() {
    if (process.env.DEMO_LOGIN_ENABLED !== 'true') {
        const { DemoLoginDisabledError } = require('../errors');
        throw new DemoLoginDisabledError();
    }
    const username = process.env.DEMO_USERNAME;
    if (!username) {
        const { DemoLoginDisabledError } = require('../errors');
        throw new DemoLoginDisabledError();
    }
    const user = await findByUsername(username);
    if (!user) throw new UserNotFoundError();
    if (!user.isActive) {
        const { AccountDeactivatedError } = require('../errors');
        throw new AccountDeactivatedError();
    }
    const token = signToken({ userId: user.id, role: user.role, communityId: user.community.id });
    return {
        token,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        community: {
            id: user.community.id,
            name: user.community.name,
            description: user.community.description
        }
    };
}

module.exports = { login, register, demoLogin };
