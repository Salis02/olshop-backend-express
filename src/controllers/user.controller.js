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

const getAllUser = async (req, res) => {
    try {
        return success(res, await userService.getAllUser(), 'Users data retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const data = await userService.updateProfile(req.user.uuid, req.body, req.user)
        return success(res, data, 'User profile updated successfully', 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const changeUserPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        await userService.updatePassword(req.user.uuid, { oldPassword, newPassword }, req.user);
        return success(res, null, 'Password updated successfully', 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const archieveUser = async (req, res) => {
    try {
        await userService.archieveUser(req.params.id, req.user)
        return success(res, null, 'User archieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const restoreUser = async (req, res) => {
    try {
        await userService.restoreUser(req.params.id, req.user)
        return success(res, null, 'User restored successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    getUserProfile,
    getAllUser,
    updateUserProfile,
    changeUserPassword,
    archieveUser,
    restoreUser
};