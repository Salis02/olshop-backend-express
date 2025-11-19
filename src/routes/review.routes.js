const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const reviewController = require('../controllers/review.controller')

router.post('/', authMiddleware, reviewController.createReview)
router.patch('/', authMiddleware, reviewController.updateReview)
router.get('/:product_id', authMiddleware, reviewController.getReview)

module.exports = router
