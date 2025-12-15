const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/role.middleware')
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.index);
router.post('/', authMiddleware, allowRoles('ADMIN'), categoryController.create);
router.put('/:id', authMiddleware, allowRoles('ADMIN'), categoryController.update);
router.delete('/:id', authMiddleware, allowRoles('ADMIN'), categoryController.remove);

module.exports = router;