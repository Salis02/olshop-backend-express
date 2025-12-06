const { z } = require('zod');

const addressCreateSchema = z.object({
    label: z.string().min(1, { message: "Label is required" }),
    recipient_name: z.string().min(1, { message: "Recipient name is required" }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" }).min(5, { message: "Phone number is too short" }),
    address_line: z.string().min(1, { message: "Address line is required" }),
    city: z.string().min(1, { message: "City is required" }),
    province: z.string().min(1, { message: "Province is required" }),
    postal_code: z.string()
        .regex(/^\d{3,10}$/, { message: "Invalid postal code format" })
        .min(3, { message: "Postal code is too short" }),
    is_default: z.boolean().optional(),
})

const addressUpdateSchema = addressCreateSchema.partial();

module.exports = {
    addressCreateSchema,
    addressUpdateSchema
};