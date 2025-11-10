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

const logout = async (req, res) => {
    try {
        //Untuk logout di sisi server, biasanya tidak perlu melakukan apa-apa jika menggunakan JWT.
        //Namun, jika menggunakan session, kita bisa menghancurkan session di sini.
        return success(res, null, 'User logged out successfully', 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

module.exports = { register, login, logout };