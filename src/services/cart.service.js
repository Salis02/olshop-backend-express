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

    cart.total = itemWithCalc.reduce((sum, item) => sum + item.subtotal, 0)
    cart.items = itemWithCalc

    return cart;
}

const addItemToCart = async (user_id, data) => {

    const { product_id, variant_id, quantity } = validateRequest(addCartItemSchema, data);

    // Make sure product exists
    const product = await prisma.product.findFirst({
        where: {
            uuid: product_id,
            deleted_at: null,
            status: 'active'
        },
        include: { variants: true }
    });

    if (!product) {
        throw new Error('Product not found or not published');
    }

    // If variant product exist -> fetch variant and use variant stock
    let variant = null
    if (variant_id) {
        variant = product.variants.find(v => v.id === variant_id)

        if (!variant) throw new Error("Variant not valid");
    }

    const { adjusted } = calculateAdjustedValues(product, variant)

    if (quantity > adjusted.adjustedStock) {
        throw new Error(`Only ${adjusted.adjustedStock} items in stock`);
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

        if (newQuantity > adjusted.adjustedStock) {
            throw new Error(`Only ${adjusted.adjustedStock} items in stock`);
        }

        return await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity }
        });
    }
    // snapshot -> product price when adding to cart (important for imutable)
    return await prisma.cartItem.create({
        data: {
            cart_id: cart.id,
            product_id: product.uuid,
            variant_id: variant_id ? variant_id : null,
            quantity,
            price_snapshot: adjusted.adjustedPrice
        }
    });

}

const updateCartItem = async (user_id, item_id, quantityData) => {

    const { quantity } = validateRequest(updateCartItemSchema, quantityData);

    // Get cart
    const cart = await prisma.cart.findFirst({
        where: { user_id },
        include: {
            product: true,
            variant: true
        }
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

    // // Get product to check stock
    // const product = await prisma.product.findUnique({
    //     where: { uuid: cartItem.product_id }
    // });

    const { adjustedStock } = calculateAdjustedValues(cartItem.product, cartItem.variant)

    if (quantity > adjustedStock) {
        throw new Error(`Only ${adjustedStock} items in stock`);
    }

    return await prisma.cartItem.update({
        where: { id: item_id },
        data: { quantity }
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