const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middlewares/auth.middleware')
const productVariantController = require('../controllers/productVariant.controller')
const allowRoles = require('../middlewares/role.middleware')

router.use(
    authMiddleware,
    allowRoles('SELLER', 'ADMIN')
)

router.get('/', productVariantController.getAllVariant)
router.post('/', productVariantController.createVariant)
router.patch('/:id', productVariantController.updateVariant)
router.delete('/:id', productVariantController.removeVariant)

module.exports = router