const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const wishlistController = require('../controllers/wishlist.controlle')

router.get('/', authMiddleware, wishlistController.getUserWishlist)
router.post('/', authMiddleware, wishlistController.addWishlist)
router.delete('/:product_id', authMiddleware, wishlistController.removeWishlist)

module.exports = router