const { z } = require('zod');

const createEventSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    description: z.string().optional(),
    start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid start date format'
    }),
    end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid end date format'
    }),
    status: z.enum(['upcoming', 'active', 'ended']).optional()
})

const updateEventSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
    description: z.string().optional(),
    start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid start date format'
    }).optional(),
    end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid end date format'
    }).optional(),
    status: z.enum(['upcoming', 'active', 'ended']).optional()
})

module.exports = {
    createEventSchema,
    updateEventSchema
}