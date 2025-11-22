const slugify = require('slugify');
const prisma = require('../prisma/client');


const getAllProducts = async (filters = {}) => {
    let {
        search,
        category_id,
        sort = 'created_at',
        order = 'desc',
        includeDeleted = false
    } = filters;
    const where = {};

    if (!includeDeleted) {
        where.deleted_at = null
    }

    if (search) {
        where.name = {
            contains: search,
            mode: 'insensitive'
        }
    }

    if (category_id) {
        where.category_id = Number(category_id);
    }

    const validSort = ['name', 'price', 'created_at', 'updated_at', 'stock'];

    if (!validSort.includes(sort)) sort = 'created_at';

    const validOrder = ['asc', 'desc'];

    if (!validOrder.includes(order)) order = 'desc'

    return await prisma.product.findMany({
        where,
        include: {
            category: true,
            images: true,
        },
        orderBy: {
            [sort]: order
        }
    });
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
    createProduct,
    updateProduct,
    softDelete,
    restoreProduct,
    forceDelete
};