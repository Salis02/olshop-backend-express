const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middlewares/auth.middleware')
const productImageController = require('../controllers/productImage.controller')
const { handleMulter } = require('../utils/helper')
const allowRoles = require('../middlewares/role.middleware')

router.use(
    authMiddleware,
    allowRoles('SELLER', 'ADMIN')
)

router.post('/', handleMulter, productImageController.uploadProductImage)
router.put('/:imageId/set-primary', productImageController.setPrimary)
router.delete('/:imageId', productImageController.removeProductImage)

module.exports = router