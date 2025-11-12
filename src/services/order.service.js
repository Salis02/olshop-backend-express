const prisma = require('../prisma/client');

const createOrder = async (uuid, shipping_address_id) => {
    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { uuid },
        include: {
            items: true
        }
    });
    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty or does not exist');
    }

    // Sum total price
    const total_price = cart.items.reduce(
        (sum, item) => sum + item.price_snapshot * item.quantity,
        0
    );

    // Create order code
    const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create order + order items
    const order = await prisma.order.create({
        data: {
            uuid,
            order_code: orderCode,
            total_price,
            discount_total: 0,
            shipping_fee: 0,
            grand_total: total_price,
            payment_status: 'PENDING',
            fulfillment_status: 'unfulfilled',
            shipping_address_id,
            items: {
                create: cart.items.map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price_snapshot,
                    subtotal: item.price_snapshot * item.quantity
                }))
            }
        },
        include: { items: true }
    });

    // Clear cart
    return await prisma.cartItem.deleteMany({
        where: { cart_id: cart.id }
    });
}

const getOrders = async (uuid) => {
    return await prisma.order.findMany({
        where: { uuid },
        include: { items: true },
        orderBy: { created_at: 'desc' }
    });
}

const getOrderDetails = async (userId, uuid) => {
    const order = await prisma.order.findUnique({
        where: { uuid },
        include: { items: true }
    })

    if (!order || order.uuid !== userId) {
        throw new Error('Order not found');
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderDetails
};