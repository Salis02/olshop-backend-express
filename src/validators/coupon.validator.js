const { z } = require("zod")

const createCoupunSchema = z.object({
    code: z.string()
        .min(3, 'Code must be at least 3 characters')
        .max(25, 'Code too long'),

    description: z.string().optional(),

    discount_type: z.enum([
        'percentage',
        'fixed'
    ], {
        errorMap: () => ({
            message: "Discount type must be value 'percentage' or 'fixed' "
        })
    }),

    value: z.number().min(1, 'Value must be positive'),

    max_usage: z.number()
        .min(1, 'Max usage must be at least 1'),

    min_order: z.number()
        .min(1000, "Min order must be at least 1000").optional(),

    expires_at: z.string()
})
    .superRefine((data, ctx) => {

        // percentage rule
        if (data.discount_type === "percentage" && (data.value < 1 || data.value > 100)) {
            ctx.addIssue({
                path: ["value"],
                code: z.ZodIssueCode.custom,
                message: "Percentage discount must be between 1 and 100",
            });
        }

        // fixed rule
        if (data.discount_type === "fixed" && data.value < 1000) {
            ctx.addIssue({
                path: ["value"],
                code: z.ZodIssueCode.custom,
                message: "Fixed discount must be at least 1000",
            });
        }

        // expiry rule
        const expires = new Date(data.expires_at);
        if (isNaN(expires.getTime()) || expires <= new Date()) {
            ctx.addIssue({
                path: ["expires_at"],
                code: z.ZodIssueCode.custom,
                message: "expires_at must be a future date",
            });
        }
    });

const updateCoupunSchema = z.object({
    code: z.string().min(3).max(50).optional(),
    description: z.string().optional(),
    discount_type: z.enum(['percentage', 'fixed']).optional(),
    value: z.number().min(1).optional(),
    max_usage: z.number(1).optional(),
    expires_at: z.string().optional()
})

module.exports = {
    createCoupunSchema,
    updateCoupunSchema
}