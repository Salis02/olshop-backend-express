const productService = require('../services/product.service');
const { success, error } = require('../utils/response');

const index = async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            category_id: req.query.category_id,
            sort: req.query.sort,
            order: req.query.order,
            page: req.query.page,
            limit: req.query.limit,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            rating: req.query.rating
        }
        const products = await productService.getAllProducts(filters);
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

const showSoftDelete = async (req, res) => {
    try {
        const product = await productService.getProductSoftDelete();
        return success(res, product, 'Product with soft delete retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const create = async (req, res) => {
    try {
        const product = await productService.createProduct(
            req.body, 
            req.user
        );
        return success(res, product, 'Product created successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const update = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.params.uuid,
            req.body,
            req.user
        );
        return success(res, product, 'Product updated successfully', 201);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const softDelete = async (req, res) => {
    try {
        await productService.softDelete(
            req.params.uuid,
            req.user
        );
        return success(res, productService, 'Product turn-off successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
}

const restore = async (req, res) => {
    try {
        const product = await productService.restoreProduct(
            req.params.uuid,
            req.user
        )
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
    showSoftDelete,
    create,
    update,
    softDelete,
    restore,
    forceDelete
};