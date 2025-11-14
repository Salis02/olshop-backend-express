const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const paymentController = require('../controllers/payment.controller');


router.get('/', authMiddleware, paymentController.getPayment);
router.get('/:id', authMiddleware, paymentController.getPaymentDetail);
router.post('/', authMiddleware, paymentController.createPayment);

//Admin
router.put('/:id/status', authMiddleware, paymentController.updateStatus);

module.exports = router