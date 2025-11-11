const categoryService = require('../services/category.service');
const { success, error } = require('../utils/response.util');

const index = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        return success(res, categories, 'Categories retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const create = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        return success(res, category, 'Category created successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.updateCategory(Number(id), req.body);
        return success(res, category, 'Category updated successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.deleteCategory(Number(id));
        return success(res, null, 'Category deleted successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

module.exports = {
    index,
    create,
    update,
    remove,
};