const prisma = require('../prisma/client');

const getAllCategories = async () => {
    return await prisma.category.findMany({
        orderBy: {
            created_at: 'desc',
        }
    });
}

const createCategory = async (data) => {
    const { name, slug } = data;
    const exists = await prisma.category.findFirst({
        where: { name }
    });

    if (exists) {
        throw new Error('Category already exists');
    }

    return await prisma.category.create({
        data: {
            name,
            slug
        }
    });
}

const updateCategory = async (id, data) => {
    const category = await prisma.category.findUnique({
        where: { id }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    return await prisma.category.update({
        where: { id },
        data
    });
}

const deleteCategory = async (id) => {
    const category = await prisma.category.findUnique({
        where: { id }
    });

    if (!category) {
        throw new Error('Category not found');
    }

    return await prisma.category.delete({
        where: { id }
    });
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
