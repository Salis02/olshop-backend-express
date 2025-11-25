const eventProduct = require('../services/eventProduct.service')
const { success, error } = require('../utils/response')

const createEventProduct = async (req, res) => {
    try {
        const event = await eventProduct.create(Number(req.params.id), req.body)
        return success(res, event, 'Event product created successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const removeEventProduct = async (req, res) => {
    try {
        const event = await eventProduct.remove(Number(req.params.id))
        return success(res, null, 'Event product removed successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const getByEventProduct = async (req, res) => {
    try {
        const { id } = req.params.event_id
        const event = await eventProduct.getByEvent(Number(id))
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    createEventProduct,
    removeEventProduct,
    getByEventProduct
}