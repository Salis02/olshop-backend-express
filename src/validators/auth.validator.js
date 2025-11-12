const { z } = require('zod');

// Registration validation schema
const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters long')
        .max(100, 'Name must be at most 100 characters long'),
    email: z
        .string()
        .email('Invalid email address'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(100, 'Password must be at most 100 characters long'),
    phone: z
        .string()
        .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
            message: 'Invalid phone number format',
        })
        .optional()
})

// Login validation schema
const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email address'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(100, 'Password must be at most 100 characters long'),
});

module.exports = {
    registerSchema,
    loginSchema,
};