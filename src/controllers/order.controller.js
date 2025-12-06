const orderService = require('../services/order.service');
const { success, error } = require('../utils/response');
const { validateRequest } = require('../utils/validate')
const { createOrderSchema } = require('../validators/order.validator');

const createOrder = async (req, res) => {
    try {
        const validation = validateRequest(createOrderSchema, req.body);

        const order = await orderService.createOrder(
            req.user.uuid,
            validation.shipping_address_id,
            validation.coupon_code
        );

        return success(res, order, 'Order created successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getOrders(req.uuid);
        return success(res, orders, 'Orders retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const getOrderDetails = async (req, res) => {
    try {
        const { uuid } = req.params;
        const order = await orderService.getOrderDetails(req.user.uuid, uuid);
        return success(res, order, 'Order details retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderDetails
};