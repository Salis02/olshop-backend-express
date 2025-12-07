const { z } = require('zod');

const createPaymentSchema = z.object({
    order_id: z.string().uuid({ message: 'Invalid order ID' }),
    provider: z.string().min(1, 'Provider is required'),
    reference_no: z.string().min(1, 'Reference number is required'),
    amount: z.number().positive('Amount must be a positive number'),
});

const updatePaymentStatusSchema = z.object({
    status: z.enum(['pending', 'success', 'failed', 'refunded'], {
        errorMap: () => ({ message: 'Status must be one of: pending, completed, failed' })
    }),
    paid_at: z.string().optional().refine((date) => {
        if (!date) return true; // allow undefined
        return !isNaN(Date.parse(date));
    }, { message: 'Invalid date format for paid_at' }),
});

module.exports = {
    createPaymentSchema,
    updatePaymentStatusSchema,
};

