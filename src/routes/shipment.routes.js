const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const shipmentController = require('../controllers/shipment.controller')
const allowRoles = require('../middlewares/role.middleware')

router.get('/', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), shipmentController.getShipments)
router.post('/', authMiddleware, allowRoles('SELLER', 'ADMIN'), shipmentController.createShipment)
router.put('/:id/status', authMiddleware, allowRoles('SELLER', 'ADMIN'), shipmentController.updateStatus)

module.exports = router
