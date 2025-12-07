const prisma = require('../prisma/client');
const { validateRequest } = require('../utils/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');

const getAllCategories = async () => {
    return await prisma.category.findMany({
        orderBy: {
            created_at: 'desc',
        }
    });
}

const createCategory = async (data) => {

    const payload = validateRequest(createCategorySchema, data);

    const exists = await prisma.category.findFirst({
        where: { name: payload.name }
    });

    if (exists) {
        throw new Error('Category already exists');
    }

    return await prisma.category.create({
        data: {
            payload
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

    const payload = validateRequest(updateCategorySchema, data);

    return await prisma.category.update({
        where: { id },
        data: payload
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
