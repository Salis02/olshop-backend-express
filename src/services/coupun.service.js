const prisma = require('../prisma/client')
const slugify = require('slugify')
const { validateRequest } = require('../utils/validate')
const { createCoupunSchema } = require('../validators/coupon.validator')

const create = async (data) => {
    const { code, description, discount_type, value, max_usage, min_order, expires_at } = validateRequest(createCoupunSchema, data);

    if (!code || code.trim() === "") {
        throw new Error("Coupon code is required");
    }
    // Normalize input code before processed
    const newCode = slugify(code, {
        lower: true,
        strict: true,
        replacement: '-',
        trim: true
    })

    // discount_type = percentage → value max 100%
    if (discount_type === "percentage" && (value < 1 || value > 100)) {
        throw new Error("Percentage discount must be between 1 - 100%");
    }

    // discount_type = fixed → value minimum 1000
    if (discount_type === "fixed" && value < 1000) {
        throw new Error("Fixed discount must be at least 1000");
    }

    // Expiry date check
    const expires = new Date(expires_at);
    if (expires <= new Date()) {
        throw new Error("expires_at must be a future date");
    }
    const existCoupun = await prisma.coupon.findUnique({
        where: {
            code
        }
    })

    if (existCoupun) throw new Error("Code coupun has already exist. Try to create different one.");

    return prisma.coupon.create({
        data: {
            code: newCode,
            description,
            discount_type,
            value,
            max_usage,
            min_order,
            expires_at: expires
        }
    })
}

const update = async (id, data) => {
    const exist = await prisma.coupon.findUnique({
        where: { id }
    })
    if (!exist) throw new Error("Coupun not found");

    return await prisma.coupon.update({
        where: {
            id
        },
        data
    })
}

const remove = async (id) => {
    return await prisma.coupon.delete({
        where: { id }
    })
}

const getAll = async () => {
    return await prisma.coupon.findMany()
}

const getOne = async (id) => {
    const coupon = prisma.coupon.findUnique({
        where: { id }
    })
    if (!coupon) throw new Error("Coupun not found");

}

const validateCoupun = async (code, user_id) => {
    const coupun = await prisma.coupon.findUnique({
        where: {
            code,
        }
    })
    if (!coupun) {
        throw new Error("Coupun invalid");
    }

    const now = new Date()

    if (now > coupun.expires_at) {
        throw new Error("Coupun expired");
    }

    if (coupun.current_usage >= coupun.max_usage) {
        throw new Error("Coupun usage limit reachede");
    }

    return coupun
    // (Optional) cek kuota penggunaan user
    // const used = await prisma.order.count({
    //     where: { user_id, coupon_code: code }
    // })
    // if (used >= coupon.max_usage) throw new Error('Coupon usage limit reached')
}

module.exports = {
    create,
    update,
    remove,
    getAll,
    getOne,
    validateCoupun
}