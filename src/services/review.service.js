const prisma = require('../prisma/client')

const createReview = async (user_id, data) => {
    const { product_id, rating, comment } = data

    // Check product data
    const product = await prisma.product.findUnique({
        where: {
            uuid: product_id
        }
    })

    if (!product) {
        throw new Error("Product not found");
    }

    // Check user has paid product
    const hasOrdered = await prisma.orderItem.findFirst({
        where: {
            product_id,
            order: {
                user_id,
                payment_status: 'success'
            }
        }
    })

    if (!hasOrdered) {
        throw new Error("You only can review purchased products");
    }

    // Cek user already review
    const existing = await prisma.review.findFirst({
        where: {
            product_id, user_id
        }
    })

    if (existing) {
        throw new Error("You already review this product");
    }

    return await prisma.review.create({
        data: {
            product_id,
            user_id,
            rating,
            comment
        }
    })
}

const getProductReviews = async (product_id) => {
    return await prisma.review.findMany({
        where: {
            product_id
        },
        include: {
            user: {
                select: {
                    uuid: true,
                    name: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    })
}

module.exports = {
    createReview,
    getProductReviews
}