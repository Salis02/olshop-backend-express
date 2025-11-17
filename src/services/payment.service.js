const prisma = require('../prisma/client')

const createPayment = async (user_id, data) => {
    const { order_id, provider, reference_no, amount } = data

    // Check if order exist
    const order = await prisma.order.findUnique({
        where: {
            uuid: order_id
        }
    })

    if (!order || order.user_id !== user_id) {
        throw new Error('Order not found')
    }

    // Check if this order is a first payment
    const existingOrder = await prisma.payment.findFirst({
        where: { order_id }
    })

    if (existingOrder) {
        throw new Error('Payment already exists for this order!')
    }

    // Create payment, default still pending cause we will integrating with midtrans or other providers
    const payment = await prisma.payment.create({
        data: {
            order_id,
            provider,
            reference_no,
            amount,
            status: 'pending'
        }
    })

    return payment
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

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment
}

const updatePaymentStatus = async (id, status, paid_at = null) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id
        }
    })

    if (!payment) {
        throw new Error("Payment not found");
    }

    return await prisma.payment.update({
        where: { id },
        data: { status, paid_at }
    })
}

module.exports = {
    createPayment,
    getPayment,
    getPaymentDetail,
    updatePaymentStatus
}