const express = require('express');
const multer = require('module')
const router = express.Router();
const upload = multer()
const authMiddleware = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

//Public routes
router.get('/', productController.index);
router.get('/:uuid', productController.show);

//Protected routes
router.post('/', authMiddleware, upload.none(), productController.create);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.remove);

module.exports = router;