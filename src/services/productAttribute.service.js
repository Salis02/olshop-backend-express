const prisma = require('../prisma/client')
const { validateRequest } = require('../utils/validate')
const { createProductAttributeSchema, updateProductAttributeSchema } = require('../validators/productAttribute.validator')
const log = require('../services/activity.service')

const getAll = async (productId) => {
    const attribute = await prisma.productAttribute.findMany({
        where: {
            product_id: productId
        }
    })

    if (!attribute) throw new Error("Attribute product not found");

    return attribute
}

const create = async (productId, data, actor) => {
    const { key, value } = validateRequest(createProductAttributeSchema, data)

    const attribute = await prisma.productAttribute.create({
        data: {
            product_id: productId,
            key: key,
            value: value
        }
    })

    await log.create({
        user_id: actor.uuid,
        action: `Create Product attribute product with uuid ${productId} `,
        target_type: 'Product Attribute',
        target_id: productId,
        meta: {
            attribute: {
                key,
                value
            }
        }
    })

    return attribute
}

const update = async (id, data, actor) => {

    const payload = validateRequest(updateProductAttributeSchema, data)

    const attribute = await prisma.productAttribute.findUnique({
        where: {
            id
        }
    })

    if (!attribute) throw new Error("Attribute not found!");

    const update = await prisma.productAttribute.update({
        where: { id },
        data: {
            ...payload,
        }
    })

    await log.create({
        user_id: actor.uuid,
        action: `Update Product attribute product with uuid ${id} `,
        target_type: 'Product Attribute',
        target_id: id.toString(),
        meta: {
            ...payload
        }
    })

    return update
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