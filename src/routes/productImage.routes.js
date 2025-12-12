const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middlewares/auth.middleware')
const productImageController = require('../controllers/productImage.controller')
const { handleMulter } = require('../utils/helper')

router.post('/', authMiddleware, handleMulter, productImageController.uploadProductImage)
router.put('/:imageId/set-primary', authMiddleware, productImageController.setPrimary)
router.delete('/:imageId', authMiddleware, productImageController.removeProductImage)

module.exports = router