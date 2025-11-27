const eventProduct = require('../services/eventProduct.service')
const { success } = require('../utils/response')

const createEventProduct = async (req, res, next) => {
    const event = await eventProduct.create(Number(req.params.event_id), req.body)
    return success(res, event, 'Event product created successfully', 201)
}

const removeEventProduct = async (req, res, next) => {
    const event = await eventProduct.remove(Number(req.params.id))
    return success(res, null, 'Event product removed successfully', 200)
}

const getByEventProduct = async (req, res, next) => {
    const event_id = Number(req.params.event_id)
    const event = await eventProduct.getByEvent(event_id)
    return success(res, event, 'Event product detail retrieved successfully', 200)
}

module.exports = {
    createEventProduct,
    removeEventProduct,
    getByEventProduct
}