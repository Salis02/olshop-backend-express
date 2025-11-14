const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const shipmentController = require('../controllers/shipment.controller')

router.get('/', authMiddleware, shipmentController.getShipments)
router.post('/', authMiddleware, shipmentController.createShipment)
router.put('/:id/status', authMiddleware, shipmentController.updateStatus)

module.exports = router
