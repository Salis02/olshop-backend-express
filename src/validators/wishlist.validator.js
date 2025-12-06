const { z } = require('zod');

const wishlistSchema = z.object({
    product_id: z.string().uuid({
        message: "Invalid product ID format"
    })
});

module.exports = {
    wishlistSchema
};