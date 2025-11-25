const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const eventProduct = require('../controllers/eventProduct.controller')

router.get('/:event_id', authMiddleware, eventProduct.getByEventProduct)
router.post('/:event_id', authMiddleware, eventProduct.createEventProduct)
router.delete('/:id', authMiddleware, eventProduct.removeEventProduct)

module.exports = router