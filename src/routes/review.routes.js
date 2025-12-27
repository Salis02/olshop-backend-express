const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const reviewController = require('../controllers/review.controller')
const allowRoles = require('../middlewares/role.middleware')

router.post('/', authMiddleware, allowRoles('USER'), reviewController.createReview)
router.patch('/', authMiddleware, allowRoles('USER'), reviewController.updateReview)
router.get('/:product_id', reviewController.getReview)

module.exports = router
