// src/services/authService.js
const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');
const { findByUsername } = require('../models/adminUserModel');

async function login({ username, password }) {
    const user = await findByUsername(username);
    if (!user) throw new Error('User not found');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Wrong password');
    const token = signToken({ userId: user.id, role: user.role });
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
