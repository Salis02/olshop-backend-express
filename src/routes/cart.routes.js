const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');
const allowRoles = require('../middlewares/role.middleware')

router.get('/', authMiddleware, allowRoles('USER', 'SELLER'), cartController.getCart);
router.post('/', authMiddleware, allowRoles('USER', 'SELLER'), cartController.addItem);
router.put('/:id', authMiddleware, allowRoles('USER', 'SELLER'), cartController.updateItem);
router.delete('/:id', authMiddleware, allowRoles('USER', 'SELLER'), cartController.removeItem);
router.delete('/', authMiddleware, allowRoles('USER', 'SELLER'), cartController.clearCart);

module.exports = router;