const cartService = require('../services/cart.service');
const { success, error } = require('../utils/response');

const getCart = async (req, res) => {
    try {
        const { uuid } = req.params;
        const cart = await cartService.getCart(uuid);
        return success(res, cart, 'Cart retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const addItem = async (req, res) => {
    try {
        const item = await cartService.addItem(req.user.uuid, req.body);
        return success(res, item, 'Item added to cart successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const updateItem = async (req, res) => {
    try {
        const { uuid, item_id } = req.params;
        const { quantity } = req.body;
        const item = await cartService.updateCartItem(uuid, Number(item_id), quantity);
        return success(res, item, 'Cart item updated successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const removeItem = async (req, res) => {
    try {
        const { uuid, item_id } = req.params;
        await cartService.removeCartItem(uuid, Number(item_id));
        return success(res, null, 'Cart item removed successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const clearCart = async (req, res) => {
    try {
        const { uuid } = req.params;
        await cartService.clearCart(uuid);
        return success(res, null, 'Cart cleared successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }   
}

module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart
};