const express = require('express');
const multer = require('multer')
const router = express.Router();
const upload = multer()
const authMiddleware = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

//Public routes
router.get('/', productController.index);
router.get('/:uuid', productController.show);

//Protected routes
router.post('/', authMiddleware, upload.none(), productController.create);
router.put('/:uuid', authMiddleware, productController.update);

//Soft and restore product delete
router.delete('/:uuid', authMiddleware, productController.softDelete);
router.patch('/:uuid/restore', authMiddleware, productController.restore);

// Force delete permanently
router.delete('/:uuid/force', authMiddleware, productController.forceDelete);

// Nested Images Routes
router.use('/:uuid/images', require('./productImage.routes'))

module.exports = router;