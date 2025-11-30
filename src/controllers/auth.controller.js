const authService = require('../services/auth.service');
const { success, error } = require('../utils/response.js');
const { blackListToken } = require('../utils/tokenBlacklist.js')

const register = async (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown;'
        const data = await authService.registerUser(req.body, ip)
        return success(res, data, 'User registered successfully', 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const login = async (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown;'
        const data = await authService.loginUser(req.body, ip)
        return success(res, data, 'User logged in successfully', 200);
    } catch (err) {
        return error(res, err.message, 401);
    }
}

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1]
            blackListToken(token)
        }

        return success(res, null, 'User logged out successfully', 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email)
        return success(res, null, 'Reset link sent to email')
    } catch (err) {
        return err(res, err.message)
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body
        await authService.resetPassword(token, newPassword)
        return success(res, null, 'Password successfully updated')
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
};