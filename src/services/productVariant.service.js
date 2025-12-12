const prisma = require("../prisma/client");
const { validateRequest } = require('../utils/validate')
const { createProductVariantSchema, updateProductVariantSchema } = require('../validators/productVariant.validator')

const getAll = async (productId) => {
    const variant = await prisma.productVariant.findMany({
        where: {
            product_id: productId
        }
    })

    if (!variant) throw new Error("Variant product not found");

    return variant
}

const create = async (productId, data) => {
    const { name, price_adjustment, stock_adjustment } = validateRequest(createProductVariantSchema, data)

    const variant = await prisma.productVariant.create({
        data: {
            product_id: productId,
            name,
            price_adjustment: price_adjustment || null,
            stock_adjustment: stock_adjustment || null
        }
    })

    return variant
}

const update = async (id, data) => {
    const variant = await prisma.productVariant.findUnique({
        where: {
            id
        }
    })

    if (!variant) throw new Error("Variant not found!");

    const payload = validateRequest(updateProductVariantSchema, data)

    return await prisma.productVariant.update({
        where: {
            id: Number(id)
        },
        data: {
            ...payload
        }
    })
}

const remove = async (id) => {
    const variant = await prisma.productVariant.findUnique({
        where: {
            id
        }
    })

    if (!variant) throw new Error("Variant not found!");

    return await prisma.productVariant.delete({
        where: {
            id
        }
    })
}

module.exports = {
    getAll,
    create,
    update,
    remove
}