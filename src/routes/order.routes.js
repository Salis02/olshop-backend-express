const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);
router.get('/:uuid', authMiddleware, orderController.getOrderDetails);

module.exports = router;