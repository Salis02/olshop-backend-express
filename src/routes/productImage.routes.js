const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')
const productImageController = require('../controllers/productImage.controller')

router.post('/:uuid/images', authMiddleware, upload.single('image'), productImageController.uploadProductImage)
router.put('/:imageId/set-primary', authMiddleware, productImageController.setPrimary)
router.delete('/:imageId', authMiddleware, productImageController.removeProductImage)

module.exports = router