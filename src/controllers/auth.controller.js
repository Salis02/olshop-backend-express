const authService = require('../services/auth.service');
const { success, error } = require('../utils/response.js');

const register = async (req, res) => {
    try {
        const data = await authService.registerUser(req.body)
        return success(res, data, 'User registered successfully', 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const login = async (req, res) => {
    try {
        const data = await authService.loginUser(req.body)
        return success(res, data, 'User logged in successfully', 200);
    } catch (err) {
        return error(res, err.message, 401);
    }
}

module.exports = { register, login };