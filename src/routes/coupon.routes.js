const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const couponController = require('../controllers/coupun.controller')

router.get('/', authMiddleware, couponController.getAllCoupun)
router.get('/:id', authMiddleware, couponController.getOneCoupun)
router.post('/', authMiddleware, couponController.createCoupun)
router.put('/:id', authMiddleware, couponController.updateCoupun)
router.delete('/:id', authMiddleware,  couponController.removeCoupun)

module.exports = router