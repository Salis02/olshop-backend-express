const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addItem);
router.put('/:id', authMiddleware, cartController.updateItem);
router.delete('/:id', authMiddleware, cartController.removeItem);
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;