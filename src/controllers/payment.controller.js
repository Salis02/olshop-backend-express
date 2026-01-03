const paymentService = require('../services/payment.service')
const { success, error } = require('../utils/response')

const handleNotification = async (req, res) => {
    try {
        const notification = await paymentService.processWebhook(req.body)
        return success(res, notification, 'Notification handled successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const createPayment = async (req, res) => {
    try {
        const payment = await paymentService.createPayment(req.user.uuid, req.body)
        return success(res, payment, 'Payment created sucessfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const getPayment = async (req, res) => {
    try {
        const payment = await paymentService.getPayment(req.user.uuid)
        return success(res, payment, 'Payment retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const getPaymentDetail = async (req, res) => {
    try {
        const { id } = req.params
        const payment = await paymentService.getPaymentDetail(req.user.uuid, Number(id))
        return success(res, payment, 'Payment detail retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

// For admin
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params
        const payment = await paymentService.updatePaymentStatus(Number(id), req.body)
        return success(res, payment, 'Payment updated successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    handleNotification,
    createPayment,
    getPayment,
    getPaymentDetail,
    updateStatus
};