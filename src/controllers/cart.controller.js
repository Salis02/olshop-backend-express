const cartService = require('../services/cart.service');
const { success } = require('../utils/response');

const getCart = async (req, res) => {
    const user_id = req.user.uuid;
    const cart = await cartService.getCart(user_id);
    return success(res, cart, 'Cart retrieved successfully', 200);
}

const addItem = async (req, res) => {
    const item = await cartService.addItemToCart(req.user.uuid, req.body);
    return success(res, item, 'Item added to cart successfully', 201);
}

const updateItem = async (req, res) => {
    const { id } = req.params;
    const item = await cartService.updateCartItem(
        req.user.uuid,
        Number(id),
        req.body
    );
    return success(res, item, 'Cart item updated successfully', 200);
}

const removeItem = async (req, res) => {
    const { id } = req.params;
    await cartService.removeCartItem(req.user.uuid, Number(id));
    return success(res, null, 'Cart item removed successfully', 200);
}

const clearCart = async (req, res) => {
    const user_id = req.user.uuid;
    await cartService.clearCart(user_id);
    return success(res, null, 'Cart cleared successfully', 200);
}

module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart
};