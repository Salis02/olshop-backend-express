const { z } = require('zod')

const createEventProductSchema = z.object({
    product_id: z
        .string({
            required_error: 'Product ID is required',
            invalid_type_error: 'Product Id must be a string'
        })
        .min(1, 'Product ID cannot be empty'),
    discount_value: z
        .number({
            required_error: 'Discount value is required',
            invalid_type_error: 'Discount value must be a number'
        })
        .int('Discount value must be an integer')
        .min(1, 'Discount must be at least 1')
})

module.exports = { createEventProductSchema }