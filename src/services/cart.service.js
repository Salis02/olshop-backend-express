const prisma = require('../prisma/client');
const { validateRequest } = require('../utils/validate');
const { addCartItemSchema, updateCartItemSchema } = require('../validators/cart.validator');
const { calculateAdjustedValues } = require('../utils/helper')

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

    // Recalculate total every time getCart (important for frontend)
    const itemWithCalc = cart.items.map(item => {
        const { adjustedPrice } = calculateAdjustedValues(item.product, item.variant)
        return {
            ...item,
            current_price: adjustedPrice, // realtime price not snapshoot
            subtotal: adjustedPrice * item.quantity
        }
    })

    cart.total 

    return cart;
}

const addItemToCart = async (user_id, data) => {

    const { product_id, variant_id, quantity } = validateRequest(addCartItemSchema, data);

    // Make sure product exists
    const product = await prisma.product.findFirst({
        where: {
            uuid: product_id,
            deleted_at: null
        }
    });

    if (!product) {
        throw new Error('Product not found');
    }

    // If variant product exist -> fetch variant and use variant stock
    let stockToCheck = product.stock
    let variant = null
    if (variant_id) {
        variant = await prisma.productVariant.findFirst({
            where: {
                id: variant_id,
                product_id: product.uuid
            }
        })

        if (!variant) throw new Error("Variant not found");
        stockToCheck = variant.stock_adjustment
    }

    if (quantity > stockToCheck) {
        throw new Error(`Only ${product.stock} items in stock`);
    }

    // Get or create cart user
    let cart = await prisma.cart.findFirst({ where: { user_id } });
    if (!cart) {
        cart = await prisma.cart.create({
            data: { user_id }
        });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cart_id: cart.id,
            product_id: product.uuid,
            variant_id: variant_id ?? null
        }
    });

    if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > stockToCheck) {
            throw new Error(`Only ${product.stock} items in stock`);
        }

        return await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity }
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

const updateCartItem = async (user_id, item_id, quantityData) => {

    const { quantity } = validateRequest(updateCartItemSchema, quantityData);

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