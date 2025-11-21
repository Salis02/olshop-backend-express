const productVariantService = require('../services/productVariant.service')
const { success, error } = require('../utils/response')

const getAllVariant = async (req, res) => {
    try {
        const { uuid } = req.params.uuid
        const variant = await productVariantService.getAll(uuid)
        return success(res, variant, 'Variant product retrieved successfully')
    } catch (err) {
        return error(res, err.message)
    }
}

const createVariant = async (req, res) => {
    try {
        const { uuid } = req.params
        const variant = await productVariantService.create(uuid, req.body)
        return success(res, variant, 'Variant product created successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const updateVariant = async (req, res) => {
    try {
        const variant = await productVariantService.update(Number(req.param.variantId), req.body)
        return success(res, variant, 'Variant product updated successfully')
    } catch (err) {
        return error(res, err.message)
    }
}

const removeVariant = async (req, res) => {
    try {
        await productVariantService.remove(Number(req.params.variantId))
        return success(res, null, 'Variant product removed successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}
module.exports = {
    getAllVariant,
    createVariant,
    updateVariant,
    removeVariant
}