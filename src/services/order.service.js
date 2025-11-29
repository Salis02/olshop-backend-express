const prisma = require('../prisma/client');
const couponService = require('../services/coupun.service')

const createOrder = async (user_id, shipping_address_id, coupon_code = null) => {
    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { user_id },
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

    // Coupun application
    let coupon = null
    let discount_total = 0

    if (coupon_code) {
        coupon = await couponService.validateCoupon(coupon_code, user_id)

        // Minimum order
        if (coupon.min_order && total_price < coupon.min_order) throw new Error(`Minimun order for coupun is ${coupon.min_order}`);

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

    // Final total
    const shipping_fee = 0;
    const grand_total = total_price - discount_total + shipping_fee

    // Create order code
    const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create order + order items
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create order + order items ('tx' menjadi pengganti prisma)        
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
    })
    // const order = await prisma.order.create({
    //     data: {
    //         user_id,
    //         order_code: orderCode,
    //         coupon_id: coupon ? coupon.id : null,
    //         total_price,
    //         discount_total,
    //         shipping_fee,
    //         grand_total,
    //         payment_status: 'pending',
    //         fulfillment_status: 'unfulfilled',
    //         shipping_address_id,
    //         items: {
    //             create: cart.items.map(item => ({
    //                 product_id: item.product_id,
    //                 variant_id: item.variant_id,
    //                 quantity: item.quantity,
    //                 price: item.price_snapshot,
    //                 subtotal: item.price_snapshot * item.quantity
    //             }))
    //         }
    //     },
    //     include: { items: true }
    // });

    // Increment coupun usage
    if (coupon) {
        await tx.coupon.update({
            where: {
                id: coupon_id
            },
            data: {
                current_usage: {
                    increment: 1
                }
            }
        })
    }

    // if (coupon) {
    //     await prisma.coupon.update({
    //         where: {
    //             id: coupon.id
    //         },
    //         data: {
    //             current_usage: {
    //                 increment: 1
    //             }
    //         }
    //     })
    // }

    // Clear cart
    await tx.cartItem.deleteMany({
        where: {
            cart_id: cart.id
        }
    })

    // await prisma.cartItem.deleteMany({
    //     where: { cart_id: cart.id }
    // });

    return result
}

const getOrders = async (user_id) => {
    return await prisma.order.findMany({
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
                    product: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
        },
        orderBy: { created_at: 'desc' }
    });
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
        throw new Error('Order not found');
    }
    return order;
}

module.exports = {
    createOrder,
    getOrders,
    getOrderDetails
};