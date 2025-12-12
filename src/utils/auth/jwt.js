const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET is missing");
}

const JWT_SECRET = process.env.JWT_SECRET
let JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
let JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN

if (process.env.NODE_ENV === 'development') {
    JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN_DEV || '6h'
    JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN_DEV || '30d'
}

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_TOKEN })
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
};