const slugify = require('slugify');
const prisma = require('../prisma/client');


const getAllProducts = async (filters = {}) => {
    const where = {};

    if (filters.categoryId) {
        where.categoryId = Number(filters.categoryId);
    }
    if (filters.search) {
        where.name = {
            contains: filters.search,
            mode: 'insensitive',
        };
    }

    return await prisma.product.findMany({
        where: {
            deleted_at: null
        },
        include: {
            category: true,
            images: true
        },
        orderBy: { created_at: 'desc' }
    });
}

const getProductById = async (uuid) => {
    const product = await prisma.product.findUnique({
        where: { uuid },
        include: {
            category: true,
            images: true
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

const deleteProduct = async (uuid, userId = null) => {
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

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};