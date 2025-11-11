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

const createProduct = async (data) => {
    const { name, price, stock, description, category_id } = data;
    return await prisma.product.create({
        data: {
            name,
            price: Number(price),
            stock: Number(stock),
            description,
            categoryId: Number(category_id)
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