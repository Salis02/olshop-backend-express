const prisma = require('../prisma/client')
const { validateRequest } = require('../utils/validate')
const { createPaymentSchema, updatePaymentStatusSchema } = require('../validators/payment.validator')
const { snap } = require('../utils/midtrans')

const processWebhook = async (notification) => {
    const statusResponse = await snap.transaction.notification(notification);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let targetStatus = 'pending';

    if (transactionStatus == 'capture') {
        if (fraudStatus == 'accept') targetStatus = 'success';
    } else if (transactionStatus == 'settlement') {
        targetStatus = 'success';
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
        targetStatus = 'failed';
    }

    // Gunakan Transaction untuk memastikan kedua tabel terupdate bersamaan
    return await prisma.$transaction(async (tx) => {
        // 1. Update Tabel Payment
        const updatedPayment = await tx.payment.updateMany({
            where: { order_id: orderId },
            data: {
                status: targetStatus,
                paid_at: targetStatus === 'success' ? new Date() : null
            }
        });

        // 2. Update Tabel Order
        await tx.order.update({
            where: { uuid: orderId },
            data: { payment_status: targetStatus }
        });

        console.log(`Webhook Success: Order ${orderId} is now ${targetStatus}`);
        return updatedPayment;
    });
}

const createPayment = async (user_uuid, data) => {
    const { order_id, provider, amount } = validateRequest(createPaymentSchema, data)

    // Check if order exist
    const order = await prisma.order.findUnique({
        where: { uuid: order_id },
        include: { user: true }
    })

    if (!order || order.user.uuid !== user_uuid) throw new Error('Order not found');
    if (order.payment_status !== 'pending') throw new Error("Order has been paid or canceled");
    if (amount !== order.grand_total) throw new Error("Amount is not valid");

    // 1. Check if payment was existing for this order
    const existingPayment = await prisma.payment.findFirst({
        where: { order_id }
    })

    if (existingPayment) return existingPayment

    // 2. Prepare parameters for midtrans snap
    let parameter = {
        transaction_details: {
            order_id: order.uuid,
            gross_amount: Math.round(amount),
        },
        customer_details: {
            first_name: order.user.name,
            email: order.user.email
        },
        // Optional : paramater payment method
        // enable_payments: [provider] || undefined,
    }

    // 3. Call midtrans snap to create transaction

    let transaction;
    try {
        transaction = await snap.createTransaction(parameter); // return token and redirect_url
        console.log("Midtrans Response:", transaction);
    } catch (err) {
        console.error("Midtrans Error Detail:", err); // Lihat detail di terminal Anda!
        throw err;
    }

    // 4. Create payment, default still pending cause we will integrating with midtrans or other providers
    return await prisma.payment.create({
        data: {
            order_id,
            provider,
            reference_no: transaction.token,
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

    return await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({
            where: { id },
            select: { order_id: true, status: true }
        })

        if (!payment) {
            throw new Error("Payment not found");
        }

        if (payment.status === 'success') return payment;

        const updated = await tx.payment.update({
            where: { id },
            data: {
                status: payload.status,
                paid_at: payload.paid_at ? new Date(payload.paid_at) : null
            }
        })

        // sync status change dengan order
        await tx.order.update({
            where: { uuid: payment.order_id },
            data: { payment_status: payload.status }
        });

        return updated
    })
}

module.exports = {
    processWebhook,
    createPayment,
    getPayment,
    getPaymentDetail,
    updatePaymentStatus
}