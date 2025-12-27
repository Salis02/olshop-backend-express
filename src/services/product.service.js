const slugify = require('slugify');
const prisma = require('../prisma/client');
const { validateRequest } = require('../utils/validate');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const log = require('../services/activity.service')
const { normalizeImage } = require('../utils/helper')
const {
    NotFoundError,
    ValidationError,
    ForbiddenError,
    ConflictError
} = require('../utils/AppError');
const prisma = require('../prisma/client');
const { validateRequest } = require('../utils/validate');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const log = require('../services/activity.service')
const { normalizeImage } = require('../utils/helper')

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
                    category: {
                        select: {
                            name: true,
                            description: true
                        }
                    },
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
                    category: {
                        select: {
                            name: true,
                            description: true
                        }
                    },
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

    const baseUrl = `${process.env.APP_URL || "http://localhost:5000"}`;
    processed = processed.map(p => normalizeImage(p, baseUrl));

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
            data: paginated
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

    const baseUrl = `${process.env.APP_URL || "http://localhost:5000"}`;
    return normalizeImage(product, baseUrl);
}

const getProductSoftDelete = async () => {
    const product = await prisma.product.findMany({
        where: {
            deleted_at: { not: null }
        }
    })
    return product
}

const createProduct = async (data, user) => {

    if (!user) {
        throw new ValidationError('User UUID is required to create a product');
    }

    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
        throw new ForbiddenError("You are not allowed to create product");
    }

    const {
        name,
        price,
        stock,
        description,
        category_id
    } = validateRequest(createProductSchema, data);

    // Generate slug and SKU
    const slug = slugify(name, { lower: true, strict: true });

    const existingSlug = await prisma.product.findUnique({ where: { slug: slug } })

    if (existingSlug) throw new ConflictError("Slug already exist");

    const sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const product = await prisma.product.create({
        data: {
            name,
            slug,
            price: Number(price),
            stock: Number(stock),
            description,
            sku,
            category: {
                connect: { id: Number(category_id) }
            },
            creator: {
                connect: { uuid: user.uuid }
            }
        }
    });

    await log.create({
        user_id: user.uuid,
        action: 'Create product',
        target_type: `Products with id ${product.uuid}`,
        target_id: product.uuid,
        meta: {
            name: name,
            price: price,
            stock: stock,
            description: description
        }

    })

    return product
}

const updateProduct = async (uuid, data, user) => {
    const product = await prisma.product.findUnique({ where: { uuid } });
    if (!product) throw new NotFoundError('Product not found');

    if (user.role_name === 'SELLER' && product.created_by !== user.uuid) {
        throw new ForbiddenError("You don't own this product!");
    }

    const {
        name,
        price,
        stock,
        description,
        category_id
    } = validateRequest(updateProductSchema, data);

    const updateData = {};

    if (name) {
        updateData.name = name;
        updateData.slug = slugify(name, { lower: true, strict: true });
    }

    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (description !== undefined) updateData.description = description;

    if (category_id !== undefined) {
        updateData.category = {
            connect: { id: category_id }
        };
    }

    updateData.updater = {
        connect: { uuid: user.uuid }
    };

    await log.create({
        user_id: user.uuid,
        action: `Update product with id ${product.uuid}`,
        target_type: 'Products',
        target_id: product.uuid,
        meta: {
            ...updateData
        }
    })

    return prisma.product.update({
        where: { uuid },
        data: updateData
    });
};


const softDelete = async (uuid, actor) => {
    const product = await prisma.product.findUnique({ where: { uuid } });
    if (!product) {
        throw new NotFoundError('Product not found');
    }
    const softDelete = await prisma.product.update({
        where: { uuid },
        data: {
            deleted_at: new Date(),
            updated_by: actor?.uuid ?? product.updated_by
        }
    });

    await log.create({
        user_id: actor.uuid,
        action: `Archive product with uuid ${product.uuid}`,
        target_type: 'Products',
        target_id: product.uuid,
        meta: {
            changes: {
                deleted_at: {
                    before: null,
                    after: softDelete.deleted_at
                }
            },
            product: {
                name: product.name
            }
        }
    })

    return softDelete
}

const restoreProduct = async (uuid, actor) => {
    const product = await prisma.product.findUnique({
        where: {
            uuid
        }
    })

    if (!product) throw new NotFoundError("Product not found");

    if (product.deleted_at === null) throw new ValidationError("Product is not deleted");

    const restoreProduct = await prisma.product.update({
        where: {
            uuid
        },
        data: {
            deleted_at: null
        }
    })

    await log.create({
        user_id: actor.uuid,
        action: `Activated product with uuid ${product.uuid}`,
        target_type: 'Products',
        target_id: product.uuid,
        meta: {
            changes: {
                deleted_at: {
                    before: product.deleted_at,
                    after: null
                }
            },
            product: {
                name: product.name
            }
        }

    })

    return restoreProduct
}

const forceDelete = async (uuid) => {
    const product = await prisma.product.findUnique({
        where: {
            uuid
        }
    })

    if (!product) throw new NotFoundError("Product not found");

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