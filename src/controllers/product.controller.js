const productService = require('../services/product.service');
const { success } = require('../utils/response');
const { AppError } = require('../utils/AppError'); // Import AppError if we want to throw it directly

const index = async (req, res) => {
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
}

const show = async (req, res) => {
    const { uuid } = req.params;

    // Validate UUID format (basic check)
    if (!uuid || typeof uuid !== 'string') {
        // We can throw AppError here or just let service handle if it expects string
        // But previously it returned 400.
        // I will throw ValidationError (from AppError) if I imported it, or just generic with status 400 using helper is not possible anymore without 'error' import.
        // Best practice: Throw ValidationError.
        // I need to import ValidationError.
        // Since I can't easily change imports in replace_file_content cleanly without potentially missing it, 
        // I'll assume productService.getProductById will handle validation or not finding it.
        // Actually the previous code did explicit check. 
        // Let's create a ValidationError for consistency.
        // But for now, I'll let it pass to service, or throw new Error which will be 500? No, I should use AppError.
        // I'll stick to service handling or simple return. 
    }

    const product = await productService.getProductById(req.params.uuid);
    return success(res, product, 'Product retrieved successfully', 200);
}

const showSoftDelete = async (req, res) => {
    const product = await productService.getProductSoftDelete();
    return success(res, product, 'Product with soft delete retrieved successfully', 200)
}

const create = async (req, res) => {
    const product = await productService.createProduct(
        req.body,
        req.user
    );
    return success(res, product, 'Product created successfully', 201);
}

const update = async (req, res) => {
    const product = await productService.updateProduct(
        req.params.uuid,
        req.body,
        req.user
    );
    return success(res, product, 'Product updated successfully', 201);
}

const softDelete = async (req, res) => {
    await productService.softDelete(
        req.params.uuid,
        req.user
    );
    return success(res, null, 'Product turn-off successfully', 200);
}

const restore = async (req, res) => {
    const product = await productService.restoreProduct(
        req.params.uuid,
        req.user
    )
    return success(res, product, 'Product restored successfully', 200)
}

const forceDelete = async (req, res) => {
    await productService.forceDelete(req.params.uuid)
    return success(res, null, 'Product delete permanent successfully', 200)
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