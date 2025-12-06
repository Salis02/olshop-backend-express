const { z } = require('zod');

const addCartItemSchema = z.object({
    product_id: z.string().uuid({ message: 'Invalid product ID' }).nonempty({ message: 'Product ID is required' }),
    variant_id: z.string().uuid({ message: 'Invalid variant ID' }).optional().nullable(),
    quantity: z.number({ message: 'Quantity is required' }).int().positive().min(1, { message: 'Quantity must be at least 1' })
})

const updateCartItemSchema = z.object({
    quantity: z.number({ message: 'Quantity is required' }).int().positive().min(1, { message: 'Quantity must be at least 1' })
})

module.exports = {
    addCartItemSchema,
    updateCartItemSchema
};