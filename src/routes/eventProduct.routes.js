const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const eventProduct = require('../controllers/eventProduct.controller')

router.get('/:event_id/products', authMiddleware, eventProduct.getByEventProduct)
router.post('/:event_id/products', authMiddleware, eventProduct.createEventProduct)
router.delete('/:event_id/products/:id', authMiddleware, eventProduct.removeEventProduct)

module.exports = router