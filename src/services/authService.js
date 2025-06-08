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

module.exports = { login };
