const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middlewares/auth.middleware')
const productAtrributeController = require('../controllers/productAttribute.controller')

router.get('/', authMiddleware, productAtrributeController.getAllAttribute)
router.post('/', authMiddleware, productAtrributeController.createAttribute)
router.patch('/:id', authMiddleware, productAtrributeController.updateAttribute)
router.delete('/:id', authMiddleware, productAtrributeController.removeAttribute)

module.exports = router