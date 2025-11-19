const reviewService = require('../services/review.service')
const { success, error } = require('../utils/response')

const createReview = async (req, res) => {
    try {
        const review = await reviewService.createReview(req.user.uuid, req.body)
        return success(res, review, 'Reviews created successfullly', 201)
    } catch (err) {
        return error(res, err.message)
    }

}

const updateReview = async (req, res) => {
    try {
        const review = await reviewService.updateReview(req.user.uuid, req.body)
        return success(res, review, 'Review updated successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}


const getReview = async (req, res) => {
    try {
        const review = await reviewService.getProductReviews(req.params.product_id)
        return success(res, review, 'Reviews retrieved successfullly', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    createReview,
    updateReview,
    getReview
}