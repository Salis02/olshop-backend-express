const wishlistService = require('../services/wishlist.service')
const { success, error } = require('../utils/response')

const addWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.add(req.user.uuid, req.body.product_id)
        return success(res, wishlist, 'Wishlist has been added', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const removeWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.remove(req.user.uuid, req.body.product_id)
        return success(res, wishlist, 'Wishlist has been removed', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const getUserWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.getUserWishlist(req.user.uuid)
        return success(res, wishlist, 'User wishlist retrieved successfully')
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    addWishlist,
    removeWishlist,
    getUserWishlist
}