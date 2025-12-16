const prisma = require('../prisma/client')
const upload = require('../middlewares/upload.middleware')
const multer = require('multer')
const { error } = require('../utils/response');

// Upload and validation multer
const handleMulter = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            let message = 'Something wrong when upload file'
            let statusCode = 400;

            // If error is from multer
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    message = 'Your file is too large. File max size is 5MB'
                }
            } else if (err.message === 'File type not allowed') {
                message = 'File type not allowed. Only accept JPEG, PNG, JPG, and WEBP';
            } else {
                message = err.message || 'Error when trying to process file'
            }
            return error(res, message, statusCode)
        }
        
        if (!req.file) return error(res, 'Product image is required', 400)
        // Contine to middleware/controller if not error
        next()
    })
}

// Normalize Image Product
const normalizeImage = (product, baseUrl) => {
    if (!product.images) return product;

    return {
        ...product,
        images: product.images.map(img => {
            const norm = img.path.replace(/\\/g, '/');
            return {
                ...img,
                path: norm,
                url: `${baseUrl}/${norm}`
            };
        })
    };
};

// Normalize response from WhatsApp WebJs
const serializeMessage = (msg) => {
    return {
        message_id: msg.id._serialized,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp,
        ack: msg.ack // 0 sent, 1 delivered to server, 2 delivered to phone, 3 read
    }
}

// Helper to checking ready of client WhatsApp WebJs
const waitUntilReady = async (client) => {
    if (client.info && client.info.wid) return true;

    return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("WhatsApp is not ready")), 15000);

        client.once("ready", () => {
            clearTimeout(timeout);
            resolve(true);
        });
    });
};

// Helper to calculate adjustment price/stock product variant
const calculateAdjustedValues = (product, variant) => {
    const basePrice = product.price
    const baseStock = product.stock

    const priceAdjustment = variant?.price_adjustment || 0
    const stockAdjustment = variant?.stock_adjustment || 0

    return {
        adjustedPrice: basePrice + priceAdjustment,
        adjustedStock: baseStock + stockAdjustment,
        variant // return variant to reuse again
    }
}

// Helper to check ownership product
const assertProductOwnership = async ({ product_id, user }) => {
    const product = await prisma.product.findUnique({
        where: { uuid: product_id },
        select: { created_by: true }
    })

    if (!product) throw new Error("Product not found");

    if (user.role === 'ADMIN') return

    if (product.created_by !== user.uuid) throw new Error("Forbidden: You don't own this product");

}

// Helper to adjust stock after status payment order
const adjustStock = async (orderId, action = 'decrement') => {
    const order = await prisma.order.findUnique({
        where: { uuid: orderId },
        include: {
            items: {
                include: { product: true, variant: true }
            }
        }
    })

    for (const item of order.items) {
        const multiplier = action === 'decrement' ? -1 : 1 // increment if rollback
        await prisma.product.update({
            where: { uuid: item.product_id },
            data: {
                stock: {
                    [action === 'decrement' ? 'decrement' : 'increment']: item.quantity * multiplier
                }
            }
        })
    }
}

// WEBHOOK / CALLBACK DARI MIDTRANS, XENDIT, DLL
const handlePaymentWebhook = async (payload) => {
    const { order_id, status, fraud_status } = validateRequest(webhookPaymentSchema, payload);

    const order = await prisma.order.findUnique({ where: { uuid: order_id } });
    if (!order) throw new Error('Order not found');

    const finalStatus =
        status === 'capture' || status === 'settlement'
            ? 'paid'
            : status === 'expire' || status === 'cancel' || status === 'deny'
                ? 'failed'
                : 'pending';

    await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.updateMany({
            where: { order_id },
            data: { status: finalStatus, paid_at: finalStatus === 'paid' ? new Date() : null }
        });

        // Update order
        await tx.order.update({
            where: { uuid: order_id },
            data: {
                payment_status: finalStatus,
                fulfillment_status: finalStatus === 'paid' ? 'processing' : 'unfulfilled'
            }
        });

        // KRUSIAL: Kurangi stok hanya saat benar-benar dibayar
        if (finalStatus === 'paid') {
            await adjustStock(order_id, 'decrement');
        }

        // Kalau expired/gagal → kembalikan stok
        if (finalStatus === 'failed' && order.payment_status === 'pending') {
            await adjustStock(order_id, 'increment');
        }
    });

    return success;
};


module.exports = {
    normalizeImage,
    serializeMessage,
    waitUntilReady,
    handleMulter,
    calculateAdjustedValues,
    handlePaymentWebhook,
    assertProductOwnership
}