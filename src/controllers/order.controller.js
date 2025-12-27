const orderService = require('../services/order.service');
const { success } = require('../utils/response');
const { validateRequest } = require('../utils/validate')
const { createOrderSchema } = require('../validators/order.validator');

const createOrder = async (req, res) => {
    const validation = validateRequest(createOrderSchema, req.body);

    const order = await orderService.createOrder(
        req.user.uuid,
        validation.shipping_address_id,
        validation.coupon_code
    );

    return success(res, order, 'Order created successfully', 201);
}

const getOrders = async (req, res) => {
    const orders = await orderService.getOrders(req.user.uuid, req.query);
    return success(res, orders, 'Orders retrieved successfully', 200);
}

const getOrderDetails = async (req, res) => {
    const { uuid } = req.params;
    const order = await orderService.getOrderDetails(req.user.uuid, uuid);
    return success(res, order, 'Order details retrieved successfully', 200);
}

module.exports = {
    createOrder,
    getOrders,
    getOrderDetails
};