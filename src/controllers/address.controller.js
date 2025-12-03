const addressService = require('../services/address.service.js');
const { success, error } = require('../utils/response.js');

const list = async (req, res) => {
    try {
        const addresses = await addressService.getAddressesByUserId(req.user.uuid);
        return success(res, addresses, 'Addresses retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const create = async (req, res) => {
    try {
        const address = await addressService.createAddress(req.user.uuid, req.user, req.body);
        return success(res, address, 'Address created successfully', 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await addressService.updateAddress(Number(id), req.user.uuid, req.body);
        return success(res, address, 'Address updated successfully', 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await addressService.deleteAddress(Number(id), req.user.uuid);
        return success(res, null, 'Address deleted successfully', 200);
    } catch (err) {
        return error(res, err.message, 400);
    }
}

module.exports = { list, create, update, remove };