const slugify = require('slugify');
const prisma = require('../prisma/client');
const { success, error } = require('../utils/response');


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
        where,
        include: {
            category: true,
            images: true
        },
        orderBy: { created_at: 'desc' }
    });
}

const getProductById = async (id) => {
    const product = await prisma.product.findUnique({
        where: { id },
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

const updateProduct = async (id, data) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        throw new Error('Product not found');
    }

    return await prisma.product.update({
        where: { id },
        data,
    });
}

const deleteProduct = async (id) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        throw new Error('Product not found');
    }
    return await prisma.product.delete({ where: { id } });
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};