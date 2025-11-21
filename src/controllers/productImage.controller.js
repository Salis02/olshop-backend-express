const productImageService = require('../services/productImage.service')
const { success, error } = require('../utils/response')

const uploadProductImage = async (req, res) => {
    try {
        const { uuid } = req.params
        const filePath = req.file.path
        const product = await productImageService.createImage(uuid, filePath)
        return success(res, product, 'Image product uploaded successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const removeProductImage = async (req, res) => {
    try {
        await productImageService.deleteImage(Number(req.params.imageId))
        return success(res, null, 'Image product removed successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const setPrimary = async (req, res) => {
    try {
        const image = await productImageService.setPrimary(Number(req.params.imageId))
        return success(res, image, 'Image set as primary successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    uploadProductImage,
    removeProductImage,
    setPrimary
}