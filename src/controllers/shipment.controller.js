const shipmentService = require('../services/shipment.service')
const { success, error } = require('../utils/response')

const getShipments = async (req, res) => {
    try {
        const shipments = await shipmentService.getShipments(req.user.uuid)
        return success(res, shipments, 'Shipment retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const createShipment = async (req, res) => {
    try {
        const shipment = await shipmentService.createShipment(req.body.order_id, req.body)
        return success(res, shipment, 'Shipment created successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        const shipment = await shipmentService.updateStatus(Number(id), status)
        return success(res, shipment, 'Shipment updated successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    getShipments,
    createShipment,
    updateStatus
}