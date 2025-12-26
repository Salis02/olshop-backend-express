const prisma = require('../prisma/client')
const { validateRequest } = require('../utils/validate')
const { createReviewSchema, updateReviewSchema } = require('../validators/review.validator')

/**
 * Shared validation: cek apakah product valid
 */
const checkProduct = async (product_id) => {
    const product = await prisma.product.findUnique({
        where: { uuid: product_id }
    })
    if (!product) throw new Error("Product not found")
    return product
}

/**
 * Shared validation: cek apakah user pernah membeli produk
 */
const checkUserPurchased = async (user_id, product_id) => {
    const hasOrdered = await prisma.orderItem.findFirst({
        where: {
            product_id,
            order: {
                user_id,
                payment_status: "success"
            }
        }
    })

    if (!hasOrdered) {
        throw new Error("You only can review purchased products")
    }

    return true
}

/**
 * CREATE REVIEW
 */
const createReview = async (user_id, data) => {
    const payload = validateRequest(createReviewSchema, data)

    // Validasi product & pembelian
    await checkProduct(payload.product_id)
    await checkUserPurchased(user_id, payload.product_id)

    // Cek user sudah review belum
    const existing = await prisma.review.findFirst({
        where: {
            product_id: payload.product_id,
            user_id
        }
    })

    if (existing) {
        throw new Error("You already reviewed this product")
    }

    return await prisma.review.create({
        data: {
            ...payload,
            user_id,
        }
    })
}

/**
 * UPDATE REVIEW (BEST PRACTICE)
 */
const updateReview = async (user_id, data) => {
    const payload = validateRequest(updateReviewSchema, data)

    // Validasi product & purchase
    await checkProduct(payload.product_id)
    await checkUserPurchased(user_id, payload.product_id)

    // Cek apakah review ada
    const existing = await prisma.review.findFirst({
        where: {
            product_id: payload.product_id,
            user_id
        }
    })

    if (!existing) {
        throw new Error("You haven't reviewed this product")
    }

    // Update hanya kolom yang diperlukan
    return await prisma.review.update({
        where: { id: existing.id },
        data: {
            rating: payload.rating,
            comment: payload.comment
        }
    })
}

/**
 * GET PRODUCT REVIEWS (with pagination)
 */
const getProductReviews = async (product_id, query = {}) => {
    const { parsePaginationParams, buildPaginationResponse } = require('../utils/pagination');
    const { page, limit, skip } = parsePaginationParams(query);

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { product_id },
            include: {
                user: {
                    select: {
                        uuid: true,
                        name: true
                    }
                }
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limit
        }),
        prisma.review.count({ where: { product_id } })
    ]);

    return buildPaginationResponse(page, limit, total, reviews);
}

module.exports = {
    createReview,
    updateReview,
    getProductReviews
}
