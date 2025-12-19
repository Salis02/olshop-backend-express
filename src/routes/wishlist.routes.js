const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const wishlistController = require('../controllers/wishlist.controller')
const allowRoles = require('../middlewares/role.middleware')

router.get('/', authMiddleware, allowRoles('USER'), wishlistController.getUserWishlist)
router.post('/', authMiddleware, allowRoles('USER'), wishlistController.addWishlist)
router.delete('/:product_id', authMiddleware, allowRoles('USER'), wishlistController.removeWishlist)

module.exports = router