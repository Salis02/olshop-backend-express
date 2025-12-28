const prisma = require('../prisma/client');
const couponService = require('../services/coupun.service')
const { NotFoundError, ValidationError } = require('../utils/AppError');

const createOrder = async (user_id, shipping_address_id, coupon_code = null) => {

    if (!user_id) {
        throw new ValidationError('User ID is required to create an order');
    }

    // 1. Get completely cart include product and variant
    const cart = await prisma.cart.findFirst({
        where: { user_id },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            uuid: true,
                            price: true,
                            stock: true
                        }
                    },
                    variant: {
                        select: {
                            id: true,
                            price_adjustment: true,
                            stock_adjustment: true
                        }
                    }
                }
            }
        }
    });

    if (!cart || cart.items.length === 0) {
        throw new ValidationError('Cart is empty or does not exist');
    }

    // 2. Sum total price from price_snapshot
    const total_price = cart.items.reduce(
        (sum, item) => sum + item.price_snapshot * item.quantity,
        0
    );

    // 3. Coupun application
    let coupon = null
    let discount_total = 0

    if (coupon_code) {
        coupon = await couponService.validateCoupon(coupon_code, user_id)

        // Minimum order
        if (coupon.min_order && total_price < coupon.min_order) throw new ValidationError(`Minimun order for coupun is ${coupon.min_order}`);

        // Calculate discount
        if (coupon.discount_type === 'percentage') {
            discount_total = Math.floor(total_price * (coupon.value / 100))
        } else {
            discount_total = coupon.value
        }

        // Prevent discount > total
        if (discount_total > total_price) {
            discount_total = total_price
        }
    }
    const shipping_fee = 0;
    const grand_total = total_price - discount_total + shipping_fee

    // 4. Create order code using crypto for better uniqueness
    const crypto = require('crypto');
    const orderCode = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // 5. Create order + order items in one transaction
    const result = await prisma.$transaction(async (tx) => {
        // A. Create order + order items ('tx' menjadi pengganti prisma)        
        const order = await tx.order.create({
            data: {
                user_id,
                order_code: orderCode,
                coupon_id: coupon ? coupon.id : null,
                total_price,
                discount_total,
                shipping_fee,
                grand_total,
                payment_status: 'pending',
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
            include: {
                items: true
            }
        })

        // B. Reduce product stok and variant (IMPORTANT)
        for (const item of cart.items) {
            // Get current product stock
            const product = await tx.product.findUnique({
                where: { uuid: item.product_id },
                select: { stock: true, name: true }
            });

            if (!product) {
                throw new NotFoundError(`Product ${item.product_id} not found`);
            }

            // Check if stock is sufficient
            if (product.stock < item.quantity) {
                throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }

            // Reduce mainStock = product.stock
            await tx.product.update({
                where: { uuid: item.product_id },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            })
        }

        // C. Increment coupun usage
        if (coupon) {
            await tx.coupon.update({
                where: {
                    id: coupon.id
                },
                data: {
                    current_usage: {
                        increment: 1
                    }
                }
            })
        }

        // D. Clear cart
        await tx.cartItem.deleteMany({
            where: {
                cart_id: cart.id
            }
        })
        return order
    })

    return result
}

const getOrders = async (user_id, query = {}) => {
    const { parsePaginationParams, buildPaginationResponse } = require('../utils/pagination');
    const { page, limit, skip } = parsePaginationParams(query);

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where: { user_id },
            select: {
                uuid: true,
                order_code: true,
                grand_total: true,
                payment_status: true,
                fulfillment_status: true,
                created_at: true,
                items: {
                    select: {
                        quantity: true,
                        price: true,
                        product: { select: { name: true } },
                        variant: { select: { name: true } }
                    }
                },
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.order.count({ where: { user_id } })
    ]);

    return buildPaginationResponse(page, limit, total, orders);
}

const getOrderDetails = async (user_id, order_uuid) => {
    const order = await prisma.order.findFirst({
        where: {
            uuid: order_uuid,
            user_id
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            uuid: true,
                            name: true,
                            price: true,
                        },
                    },
                    variant: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                },
            },
            address: {
                select: {
                    id: true,
                    label: true,
                    recipient_name: true,
                    address_line: true,
                    city: true,
                    province: true,
                    postal_code: true
                }
            }
        }
    });

    if (!order) {
        throw new NotFoundError('Order not found');
    }
    return order;
}

const cancelOrder = async (user_id, order_uuid, reason = 'Customer request') => {
    const order = await prisma.order.findFirst({
        where: {
            uuid: order_uuid,
            user_id
        },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
        throw new Error('Order not found');
    }

    // Can only cancel if not paid or not shipped
    if (order.payment_status === 'success' && order.fulfillment_status !== 'unfulfilled') {
        throw new ValidationError('Cannot cancel order that has been shipped');
    }

    if (order.fulfillment_status === 'delivered') {
        throw new ValidationError('Cannot cancel delivered order');
    }

    if (order.fulfillment_status === 'cancelled') {
        throw new ValidationError('Order already cancelled');
    }

    // Use transaction to restore stock and update statuses
    return await prisma.$transaction(async (tx) => {
        // Restore stock
        for (const item of order.items) {
            await tx.product.update({
                where: { uuid: item.product_id },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            });
        }

        // Restore coupon usage if used
        if (order.coupon_id) {
            await tx.coupon.update({
                where: { id: order.coupon_id },
                data: {
                    current_usage: {
                        decrement: 1
                    }
                }
            });
        }

        // Update order status
        const cancelled = await tx.order.update({
            where: { uuid: order_uuid },
            data: {
                fulfillment_status: 'cancelled',
                payment_status: order.payment_status === 'pending' ? 'failed' : 'refunded'
            }
        });

        return cancelled;
    });
};

module.exports = {
    createOrder,
    getOrders,
    getOrderDetails,
    cancelOrder
};