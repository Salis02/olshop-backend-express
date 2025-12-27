const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const eventProduct = require('../controllers/eventProduct.controller')
const allowRoles = require('../middlewares/role.middleware')

router.get('/:event_id/products', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), eventProduct.getByEventProduct)
router.post('/:event_id/products', authMiddleware, allowRoles('ADMIN'), eventProduct.createEventProduct)
router.delete('/:event_id/products/:id', authMiddleware, allowRoles('ADMIN'), eventProduct.removeEventProduct)

module.exports = router