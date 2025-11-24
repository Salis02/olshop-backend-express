const slugify = require('slugify');
const prisma = require('../prisma/client');


const getAllProducts = async (filters = {}) => {
    let {
        search,
        category_id,
        sort = 'created_at',
        order = 'desc',
        page = 1,
        limit = 10,
        minPrice,
        maxPrice,
        rating,
        includeDeleted = false
    } = filters;

    // Pagination Product
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    // Soft Delete not sended
    if (!includeDeleted) {
        where.deleted_at = null
    }

    // Search by name
    if (search) {
        where.name = {
            contains: search,
            mode: 'insensitive'
        }
    }

    // Filter by category
    if (category_id) {
        where.category_id = Number(category_id);
    }

    // Filter price range
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice)
        if (maxPrice) where.price.lte = Number(maxPrice)
    }

    const validSort = ['name', 'price', 'created_at', 'updated_at', 'stock'];

    if (!validSort.includes(sort)) sort = 'created_at';

    const validOrder = ['asc', 'desc'];

    if (!validOrder.includes(order)) order = 'desc'

    const useRatingSort = rating === 'high' || rating === 'low'

    // Prisma order for rating
    const orderBy =
        sort === 'rating'
            ? {
                reviews: {
                    _avg: {
                        rating: order
                    }
                }
            } : { [sort]: order }

    let product = [];
    let total = 0;

    if (useRatingSort) {
        // Sort all product by rating first
        [product, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        where: { is_primary: true },
                        take: 1
                    },
                    reviews: {
                        select: {
                            rating: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' } // fallback
            }),
            prisma.product.count({ where })
        ]);
    } else {
        // Normal, pagination and sorting
        [product, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        where: {
                            is_primary: true
                        },
                        take: 1
                    },
                    reviews: {
                        select: {
                            rating: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit
            }),

            prisma.product.count({ where })
        ])
    }

    // Compute avg rating manually
    let processed = product.map(p => {
        const rating = p.reviews.map(r => r.rating);
        const avgRating = rating.length
            ? rating.reduce((a, b) => a + b, 0) / rating.length
            : 0;
        return {
            ...p,
            avg_rating: Number(avgRating.toFixed(2))
        }
    })

    // RATING SORT MODE → manual sort & manual pagination
    if (useRatingSort) {
        // Sort manually
        if (rating === 'high') {
            processed.sort((a, b) => b.avg_rating - a.avg_rating);
        } else if (rating === 'low') {
            processed.sort((a, b) => a.avg_rating - b.avg_rating);
        }

        // Manual pagination
        const paginated = processed.slice(skip, skip + limit);

        return {
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            date: paginated
        }
    }
    // NORMAL MODE → DB handles pagination
    return {
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        data: processed
    };
}

const getProductById = async (uuid) => {
    const product = await prisma.product.findUnique({
        where: { uuid },
        include: {
            category: true,
            images: true,
            variants: true,
            attributes: true,
            reviews: {
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });

    if (!product) {
        throw new Error('Product not found');
    }
    return product;
}

const getProductSoftDelete = async () => {
    const product = await prisma.product.findMany({
        where: {
            deleted_at: { not: null }
        }
    })
    return product
}

const createProduct = async (data, userId) => {
    const { name, price, stock, description, category_id } = data;

    if (!userId) {
        throw new Error('User UUID is required to create a product');
    }

    // Generate slug and SKU
    const slug = slugify(name, { lower: true, strict: true });
    const sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await prisma.product.create({
        data: {
            name,
            slug,
            price: Number(price),
            stock: Number(stock),
            description,
            sku,
            category_id: Number(category_id),
            created_by: userId
        }
    });
}

const updateProduct = async (uuid, data, userId = null) => {
    const product = await prisma.product.findUnique({ where: { uuid } });
    if (!product) {
        throw new Error('Product not found');
    }

    const { name, price, stock, description, category_id } = data

    const updateProduct = {}

    if (name) {
        updateProduct.name = name
        updateProduct.slug = slugify(name, { lower: true, strict: true })
    }

    if (price !== undefined) updateProduct.price = Number(price)
    if (stock !== undefined) updateProduct.stock = Number(stock)
    if (description !== undefined) updateProduct.description = description
    if (category_id !== undefined) updateProduct.category_id = category_id

    if (userId) updateProduct.update_by = userId

    return await prisma.product.update({
        where: { uuid },
        data: updateProduct
    });
}

const softDelete = async (uuid, userId = null) => {
    const product = await prisma.product.findUnique({ where: { uuid } });
    if (!product) {
        throw new Error('Product not found');
    }
    return await prisma.product.update({
        where: { uuid },
        data: {
            deleted_at: new Date(),
            updated_by: userId || product.updated_by
        }
    });
}

const restoreProduct = async (uuid) => {
    const product = await prisma.product.findUnique({
        where: {
            uuid
        }
    })

    if (!product) throw new Error("Product not found");

    if (product.deleted_at === null) throw new Error("Product is not deleted");

    return await prisma.product.update({
        where: {
            uuid
        },
        data: {
            deleted_at: null
        }
    })
}

const forceDelete = async (uuid) => {
    const product = await prisma.product.findUnique({
        where: {
            uuid
        }
    })

    if (!product) throw new Error("Product not found");

    return await prisma.product.delete({
        where: {
            uuid
        }
    })

}

module.exports = {
    getAllProducts,
    getProductById,
    getProductSoftDelete,
    createProduct,
    updateProduct,
    softDelete,
    restoreProduct,
    forceDelete
};