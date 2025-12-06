const { z } = require('zod');

const addressCreateSchema = z.object({
    label: z.string().min(1, { message: "Label is required" }),
    recipient_name: z.string().min(1, { message: "Recipient name is required" }),
    phone: z.string().min(5, { message: "Phone number is required" }),
    address_line2: z.string().min(1, { message: "Address line 1 is required" }),
    city: z.string().min(1, { message: "City is required" }),
    province: z.string().min(1, { message: "Province is required" }),
    postal_code: z.string().min(1, { message: "Postal code is required" }),
    is_default: z.boolean().optional(),
})

const addressUpdateSchema = addressCreateSchema.partial();

module.exports = {
    addressCreateSchema,
    addressUpdateSchema
};