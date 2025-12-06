const { z } = require('zod');

const createProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
    price: z.preprocess(val => Number(val), z.number().positive('Price must be positive')),
    stock: z.preprocess(val => Number(val), z.number().int('Stock must be an integer').nonnegative('Stock cannot be negative')),
    description: z.string().max(500, 'Description too long').optional().nullable(),
    category_id: z.preprocess(val => Number(val), z.number().int('Category ID must be an integer').positive('Category ID must be positive')),
})

const updateProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long').optional(),
    price: z.preprocess(val => Number(val), z.number().positive('Price must be positive').optional()),
    stock: z.preprocess(val => Number(val), z.number().int('Stock must be an integer').nonnegative('Stock cannot be negative').optional()),
    description: z.string().max(500, 'Description too long').optional().nullable(),
    category_id: z.preprocess(val => Number(val), z.number().int('Category ID must be an integer').positive('Category ID must be positive').optional()),
})

module.exports = {
    createProductSchema,
    updateProductSchema
}