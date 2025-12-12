const { z } = require('zod')

const createProductVariantSchema = z.object({
    name: z
        .string({
            required_error: 'Variant name is required',
            invalida_type_error: 'Variant name must be a string'
        })
        .min(1, 'Variant name cannot be empty'),
    price_adjustment: z
        .number({
            invalida_type_error: 'Price adjustment must be a number'
        })
        .int('Price number must be a integer')
        .optional().nullable(),
    stock_adjustment: z
        .number({
            invalida_type_error: 'Stock adjustment must be a number'
        })
        .int('Stock number must be a integer')
        .optional().nullable()
})

const updateProductVariantSchema = createProductVariantSchema.partial()
    .refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided to update'
    })

module.exports = { createProductVariantSchema, updateProductVariantSchema }