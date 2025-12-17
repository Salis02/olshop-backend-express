const productAtrributeService = require('../services/productAttribute.service')
const { success, error } = require('../utils/response')

const getAllAttribute = async (req, res) => {
    try {
        const { uuid } = req.params
        const attribute = await productAtrributeService.getAll(uuid)
        return success(res, attribute, 'Attribute product retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const createAttribute = async (req, res) => {
    try {
        const { uuid } = req.params
        const attribute = await productAtrributeService.create(uuid, req.body, req.user)
        return success(res, attribute, 'Attribute product created successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const updateAttribute = async (req, res) => {
    try {
        const attribute = await productAtrributeService.update(Number(req.params.id), req.body)
        return success(res, attribute, 'Attribute product updated successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const removeAttribute = async (req, res) => {
    try {
        await productAtrributeService.remove(Number(req.params.id))
        return success(res, null, 'Attribute product removed successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    getAllAttribute,
    createAttribute,
    updateAttribute,
    removeAttribute
}