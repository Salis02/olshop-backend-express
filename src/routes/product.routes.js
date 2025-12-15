const express = require('express');
const router = express.Router();
const multer = require('multer')
const upload = multer()
const authMiddleware = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/role.middleware')
const productController = require('../controllers/product.controller');

// Nested Images, Variants, and Attributes Routes
router.use('/:uuid/images', require('./productImage.routes'))
router.use('/:uuid/variants', require('./productVariant.routes'))
router.use('/:uuid/attributes', require('./productAttribute.routes'))

// Public and softdelete routes
router.get('/', productController.index);

// Static route, always use 'soft-delete'
router.get('/soft-delete', authMiddleware, allowRoles('ADMIN'), productController.showSoftDelete)

// Dynamic route, cause can receive many various of uuid
router.get('/:uuid', productController.show);

//Protected routes
router.post('/', authMiddleware, allowRoles('ADMIN', 'SELLER'), upload.none(), productController.create);
router.put('/:uuid', authMiddleware, allowRoles('ADMIN', 'SELLER'), productController.update);

//Soft and restore product delete
router.delete('/:uuid', authMiddleware, allowRoles('ADMIN', 'SELLER'), productController.softDelete);
router.patch('/:uuid/restore', authMiddleware, allowRoles('ADMIN'), productController.restore);

// Force delete permanently
router.delete('/:uuid/force', authMiddleware, allowRoles('ADMIN'), productController.forceDelete);

module.exports = router;