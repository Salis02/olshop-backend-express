const productService = require('../services/product.service');
const { success, error } = require('../utils/response');

const index = async (req, res) => {
    try {
        const products = await productService.getAllProducts(req.query);
        return success(res, products, 'Products retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const show = async (req, res) => {
    try {
        const product = await productService.getProductById(Number(req.params.id));
        return success(res, product, 'Product retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const create = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        return success(res, product, 'Product created successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const update = async (req, res) => {
    try {
        const product = await productService.updateProduct(Number(req.params.id), req.body);
        return success(res, product, 'Product updated successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const remove = async (req, res) => {
    try {
        await productService.deleteProduct(Number(req.params.id));
        return success(res, null, 'Product deleted successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

module.exports = {
    index,
    show,
    create,
    update,
    remove,
};