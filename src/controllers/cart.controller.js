const cartService = require('../services/cart.service');
const { success, error } = require('../utils/response');

const getCart = async (req, res) => {
    try {
        const { user_id } = req.params;
        const cart = await cartService.getCart(user_id);
        return success(res, cart, 'Cart retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const addItem = async (req, res) => {
    try {
        const item = await cartService.addItemToCart(req.user.uuid, req.body);
        return success(res, item, 'Item added to cart successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await cartService.updateCartItem(
            req.user.uuid,
            Number(id),
            req.body
        );
        return success(res, item, 'Cart item updated successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const removeItem = async (req, res) => {
    try {
        const { id } = req.params;
        await cartService.removeCartItem(req.user.uuid, Number(id));
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