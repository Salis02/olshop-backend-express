const prisma = require('../prisma/client');

const getCart = async (uuid) => {
    let cart = await prisma.cart.findFirst({
        where: { uuid },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true
                }
            }
        }
    })

    // Create cart if not exists
    if (!cart) {
        cart = await prisma.cart.create({
            data: { uuid }
        });
    }
}

const addItemToCart = async (uuid, data) => {
    const { product_id, variant_id, quantity } = data;

    // Make sure product exists
    const product = await prisma.product.findUnique({
        where: { uuid: product_id }
    });

    if (!product) {
        throw new Error('Product not found');
    }

    // Get or create cart user
    let cart = await prisma.cart.findFirst({
        where: { uuid },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { uuid }
        });
    }

    // Checck if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cart_id: cart.id,
            product_id: product.id,
            variant_id: variant_id ? variant_id : null
        }
    });

    if (existingItem) {
        // Update quantity
        return await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantity
            }
        });
    } else {
        // snapshot -> product price when adding to cart
        return await prisma.cartItem.create({
            data: {
                cart_id: cart.id,
                product_id: product.id,
                variant_id: variant_id ? variant_id : null,
                quantity,
                price_snapshot: product.price
            }
        });
    }
}

const updateCartItem = async (uuid, item_id, quantity) => {
    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { uuid },
    });
    if (!cart) {
        throw new Error('Cart not found');
    }

    // Get cart item
    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: item_id,
            cart_id: cart.id
        }
    });
    if (!cartItem) {
        throw new Error('Cart item not found');
    }

    return await prisma.cartItem.update({
        where: { id: item_id },
        data: { quantity }
    });
}

const removeCartItem = async (uuid, item_id) => {
    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { uuid },
    })
    if (!cart) {
        throw new Error('Cart not found');
    }

    return await prisma.cartItem.deleteMany({
        where: {
            id: item_id,
            cart_id: cart.id
        }
    });
}

const clearCart = async (uuid) => {
    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { uuid },
    });
    if (!cart) {
        throw new Error('Cart not found');
    }
    return await prisma.cartItem.deleteMany({
        where: {
            cart_id: cart.id
        }
    });
}

module.exports = {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};