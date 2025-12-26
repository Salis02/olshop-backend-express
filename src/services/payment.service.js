const prisma = require('../prisma/client')
const { validateRequest } = require('../utils/validate')
const { createPaymentSchema, updatePaymentStatusSchema } = require('../validators/payment.validator')

const createPayment = async (user_id, data) => {
    const { order_id, provider, reference_no, amount } = validateRequest(createPaymentSchema, data)

    // Check if order exist
    const order = await prisma.order.findUnique({
        where: {
            uuid: order_id
        }
    })

    if (!order || order.user_id !== user_id) throw new Error('Order not found');
    if (order.payment_status !== 'pending') throw new Error("Order has been paid or canceled");

    // Checking amount is right
    if (amount !== order.grand_total) throw new Error("Amount is not valid");

    // Check if this order is a first payment
    const existingOrder = await prisma.payment.findFirst({
        where: { order_id }
    })

    // if (existingOrder) throw new Error('Payment already exists for this order!')
    if (existingOrder) return existingOrder


    // Create payment, default still pending cause we will integrating with midtrans or other providers
    return await prisma.payment.create({
        data: {
            order_id,
            provider,
            reference_no,
            amount,
            status: 'pending'
        }
    })
}

const getPayment = async (user_id) => {
    return await prisma.payment.findMany({
        where: {
            order: {
                user_id
            }
        },
        include: {
            order: true
        },
        orderBy: {
            created_at: 'desc'
        },
    })
}

const getPaymentDetail = async (user_id, id) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id
        },
        include: {
            order: true
        }
    })

    if (!payment || payment.order.user_id !== user_id) {
        throw new Error("Payment not found");
    }

    return payment
}

// Manual update payment status
const updatePaymentStatus = async (id, data) => {

    const payload = validateRequest(updatePaymentStatusSchema, data)

    const payment = await prisma.payment.findUnique({
        where: {
            id
        }
    })

    if (!payment) {
        throw new Error("Payment not found");
    }

    const updated = await prisma.payment.update({
        where: { id },
        data: {
            status: payload.status,
            paid_at: payload.paid_at || null
        }
    })

    // sync status change dengan order
    await prisma.order.update({
        where: {
            uuid: payment.order_id
        },
        data: {
            payment_status: payload.status
        }
    })

    return updated
}

module.exports = {
    createPayment,
    getPayment,
    getPaymentDetail,
    updatePaymentStatus
}