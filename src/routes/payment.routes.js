const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const paymentController = require('../controllers/payment.controller');
const allowRoles = require('../middlewares/role.middleware');


router.get('/', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), paymentController.getPayment);
router.get('/:id', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), paymentController.getPaymentDetail);
router.post('/', authMiddleware, allowRoles('USER'), paymentController.createPayment);

//Admin
router.put('/:id/status', authMiddleware, allowRoles('ADMIN'), paymentController.updateStatus);

module.exports = router