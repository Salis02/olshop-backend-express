const { z } = require('zod');

const createOrderSchema = z.object({
    shipping_address_id: z.number({
        required_error: "Shipping address ID is required",
        invalid_type_error: "Shipping address ID must be a number"
    }).int().positive('Shipping address ID must be a positive integer'),

    coupon_code: z.string().trim().optional().nullable().default(null)
})

module.exports = {
    createOrderSchema
}