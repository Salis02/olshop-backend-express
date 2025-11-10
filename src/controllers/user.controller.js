const userService = require('../services/user.service');
const { success, error } = require('../utils/response.js');

const getUserProfile = async (req, res) => {
    try {
        const data = await userService.getProfile(req.user.uuid);
        return success(res, data, 'User profile retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 404);
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const data = await userService.updateProfile(req.user.uuid, req.body);
        return success(res, data, 'User profile updated successfully', 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const changeUserPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        await userService.updatePassword(req.user.uuid, { oldPassword, newPassword });
        return success(res, null, 'Password updated successfully', 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

module.exports = { getUserProfile, updateUserProfile, changeUserPassword };