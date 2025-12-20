const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');
const allowRoles = require('../middlewares/role.middleware')

router.get('/', authMiddleware, allowRoles('USER'), cartController.getCart);
router.post('/', authMiddleware, allowRoles('USER'), cartController.addItem);
router.put('/:id', authMiddleware, allowRoles('USER'), cartController.updateItem);
router.delete('/:id', authMiddleware, allowRoles('USER'), cartController.removeItem);
router.delete('/', authMiddleware, allowRoles('USER'), cartController.clearCart);

module.exports = router;