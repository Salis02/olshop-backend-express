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
        const { uuid } = req.params;

        // Validate UUID format (basic check)
        if (!uuid || typeof uuid !== 'string') {
            return error(res, 'Invalid product UUID', 400);
        }

        const product = await productService.getProductById(req.params.uuid);
        return success(res, product, 'Product retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const create = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body, req.user.uuid);
        return success(res, product, 'Product created successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const update = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.uuid, req.body);
        return success(res, product, 'Product updated successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const softDelete = async (req, res) => {
    try {
        await productService.softDelete(req.params.uuid);
        return success(res, productService, 'Product turn-off successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const restore = async (req, res) => {
    try {
        const product = await productService.restoreProduct(req.params.uuid)
        return success(res, product, 'Product restored successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const forceDelete = async (req, res) => {
    try {
        await productService.forceDelete(req.params.uuid)
        return success(res, null, 'Product delete permanent successfully', 200)
    } catch (err) {
        return err(res, err.message)
    }
}

module.exports = {
    index,
    show,
    create,
    update,
    softDelete,
    restore,
    forceDelete
};