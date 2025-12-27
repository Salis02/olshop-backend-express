const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const couponController = require('../controllers/coupun.controller')
const allowRoles = require('../middlewares/role.middleware')

router.get('/', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), couponController.getAllCoupun)
router.get('/:id', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), couponController.getOneCoupun)
router.post('/', authMiddleware, allowRoles('ADMIN'), couponController.createCoupun)
router.put('/:id', authMiddleware, allowRoles('ADMIN'), couponController.updateCoupun)
router.delete('/:id', authMiddleware, allowRoles('ADMIN'), couponController.removeCoupun)

module.exports = router