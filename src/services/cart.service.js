const prisma = require('../prisma/client');
const { validate } = require('../utils/validate');
const { addCartItemSchema, updateCartItemSchema } = require('../validators/cart.validator');

const getCart = async (user_id) => {
    let cart = await prisma.cart.findFirst({
        where: { user_id },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            name: true,
                            description: true,
                            price: true,
                            stock: true,
                            sku: true
                        }
                    },
                    variant: true
                }
            }
        }
    })

    // Create cart if not exists
    if (!cart) {
        cart = await prisma.cart.create({
            data: { user_id }
        });
    }

    return cart;
}

const addItemToCart = async (user_id, data) => {

    const { product_id, variant_id, quantity } = validate(addCartItemSchema, data);

    // Make sure product exists
    const product = await prisma.product.findUnique({
        where: { uuid: product_id }
    });

    if (!product) {
        throw new Error('Product not found');
    }

    if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} items in stock`);
    }

    // Get or create cart user
    let cart = await prisma.cart.findFirst({
        where: { user_id },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { user_id }
        });
    }

    // Checck if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cart_id: cart.id,
            product_id: product.uuid,
            variant_id: variant_id ? variant_id : null
        }
    });

    if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            throw new Error(`Only ${product.stock} items in stock`);
        }

        return await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: newQuantity
            }
        });
    } else {
        // snapshot -> product price when adding to cart
        return await prisma.cartItem.create({
            data: {
                cart_id: cart.id,
                product_id: product.uuid,
                variant_id: variant_id ? variant_id : null,
                quantity,
                price_snapshot: product.price
            }
        });
    }
}

const updateCartItem = async (user_id, item_id, quantity) => {

    const { quantity } = validate(updateCartItemSchema, quantity);

    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { user_id },
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

    // Get product to check stock
    const product = await prisma.product.findUnique({
        where: { uuid: cartItem.product_id }
    });

    if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} items in stock`);
    }

    return await prisma.cartItem.update({
        where: { id: item_id },
        data: { quantity: Number(quantity) }
    });
}

const removeCartItem = async (user_id, item_id) => {
    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { user_id },
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

const clearCart = async (user_id) => {
    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { user_id },
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