const { z } = require('zod');

const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    slug: z.string().min(1, 'Category slug is required'),
    description: z.string().optional(),
})

const updateCategorySchema = createCategorySchema.partial()

module.exports = {
    createCategorySchema,
    updateCategorySchema
};