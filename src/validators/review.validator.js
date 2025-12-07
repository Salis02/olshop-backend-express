const { z } = require('zod');
const { product } = require('../prisma/client');

const createReviewSchema = z.object({
    product_id: z.string().min(1, 'Product ID is required'),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().max(1000).optional(),
});

const updateReviewSchema = z.object({
    product_id: z.string().min(1, 'Product ID is required').optional(),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5').optional(),
    comment: z.string().max(1000).optional(),
});

module.exports = {
    createReviewSchema,
    updateReviewSchema
};