const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middlewares/auth.middleware')
const productAtrributeController = require('../controllers/productAttribute.controller')

router.use(
    authMiddleware,
    allowRoles('SELLER', 'ADMIN')
)

router.get('/', productAtrributeController.getAllAttribute)
router.post('/', productAtrributeController.createAttribute)
router.patch('/:id', productAtrributeController.updateAttribute)
router.delete('/:id', productAtrributeController.removeAttribute)

module.exports = router