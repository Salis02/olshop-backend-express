const { z } = require('zod')

const createProductAttributeSchema = z.object({
    key: z
        .string({
            required_error: 'Key is required',
            invalid_type_error: 'key must be a string'
        })
        .min(1, 'Key cannot be empty'),
    value: z
        .string({
            required_error: 'Value is required',
            invalid_type_error: 'Value must be a string'
        })
        .min(1, 'Value cannot be empty')
})

const updateProductAttributeSchema = createProductAttributeSchema.partial();

module.exports = {
    createProductAttributeSchema,
    updateProductAttributeSchema
}