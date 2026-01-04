const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');
const allowRoles = require('../middlewares/role.middleware');

router.post('/', authMiddleware, allowRoles('USER', 'SELLER'), orderController.createOrder);
router.get('/', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), orderController.getOrders);
router.get('/:uuid', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), orderController.getOrderDetails);

module.exports = router;