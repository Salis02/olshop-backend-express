const prisma = require('../prisma/client')
const { validateRequest } = require('../utils/validate')
const { createProductAttributeSchema, updateProductAttributeSchema } = require('../validators/productAttribute.validator')

const getAll = async (productId) => {
    const attribute = await prisma.productAttribute.findMany({
        where: {
            product_id: productId
        }
    })

    if (!attribute) throw new Error("Attribute product not found");

    return attribute
}

const create = async (productId, data) => {
    const { key, value } = validateRequest(createProductAttributeSchema, data)

    const attribute = await prisma.productAttribute.create({
        data: {
            product_id: productId,
            key: key,
            value: value
        }
    })

    return attribute
}

const update = async (id, data) => {

    const payload = validateRequest(updateProductAttributeSchema, data)

    const attribute = await prisma.productAttribute.findUnique({
        where: {
            id
        }
    })

    if (!attribute) throw new Error("Attribute not found!");

    return await prisma.productAttribute.update({
        where: { id },
        data: {
            ...payload,
            updated_at: new Date()
        }
    })
}

const remove = async (id) => {
    const attribute = await prisma.productAttribute.findUnique({
        where: {
            id
        }
    })

    if (!attribute) throw new Error("Attribute not found!");

    return await prisma.productAttribute.delete({
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