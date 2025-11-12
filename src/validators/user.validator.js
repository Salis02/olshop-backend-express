const { z } = require('zod');

const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters long')
        .max(100, 'Name must be at most 100 characters long'),
    phone: z
        .string()
        .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
            message: 'Invalid phone number format',
        })
        .optional()
});

const updatePasswordSchema = z.object({
    oldPassword: z
        .string()
        .min(6, 'Old password must be at least 6 characters long')
        .max(100, 'Old password must be at most 100 characters long'),
    newPassword: z
        .string()
        .min(6, 'New password must be at least 6 characters long')
        .max(100, 'New password must be at most 100 characters long')
        .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
            message: 'New password must contain both letters and numbers',
        })
});

module.exports = {
    updateProfileSchema,
    updatePasswordSchema,
};