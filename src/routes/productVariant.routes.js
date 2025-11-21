const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middlewares/auth.middleware')
const productVariantController = require('../controllers/productVariant.controller')

router.get('/', authMiddleware, productVariantController.getAllVariant)
router.post('/', authMiddleware, productVariantController.createVariant)
router.patch('/:id', authMiddleware, productVariantController.updateVariant)
router.delete('/:id', authMiddleware, productVariantController.removeVariant)

module.exports = router