const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');

router.get('/:uuid', authMiddleware, cartController.getCart);
router.post('/item', authMiddleware, cartController.addItem);
router.put('/:uuid/item/:item_id', authMiddleware, cartController.updateItem);
router.delete('/:uuid/item/:item_id', authMiddleware, cartController.removeItem);
router.delete('/:uuid/clear', authMiddleware, cartController.clearCart);

module.exports = router;