const authService = require('../services/auth.service');
const { success } = require('../utils/response.js');
const { blackListToken } = require('../utils/tokenBlacklist.js')

const register = async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown;'
    const data = await authService.registerUser(req.body, ip)
    return success(res, data, 'User registered successfully', 201);
}

const login = async (req, res) => {
    // Collect IP and User Agent
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const data = await authService.loginUser(req.body, { ip, userAgent })
    return success(res, data, 'User logged in successfully', 200);
}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body || {};

    // Collect IP and User Agent for rotation tracking
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const token = await authService.refreshTokenService(refreshToken, { ip, userAgent })
    return success(res, token, 'Token successfully updated')
}

const logout = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        blackListToken(token)
    }

    if (req.user?.uuid) {
        const { refreshToken } = req.body || {};
        if (refreshToken) {
            await authService.logoutUser(refreshToken)
        }

    }

    return success(res, null, 'User logged out successfully', 200);
}

const activateAccount = async (req, res) => {
    await authService.activateAccount(req.body.token)
    return success(res, null, "Account successfully verified and activated")
}

const forgotPassword = async (req, res) => {
    await authService.forgotPassword(req.body.email)
    return success(res, null, 'Reset link sent to email')
}

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body
    await authService.resetPassword(token, newPassword)
    return success(res, null, 'Password successfully updated')
}

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    activateAccount,
    forgotPassword,
    resetPassword
};