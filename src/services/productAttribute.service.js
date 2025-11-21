const prisma = require('../prisma/client')

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
    const { key, value } = data

    const attribute = await prisma.productAttribute.create({
        where: {
            product_id: productId,
            key: key,
            value: value
        }
    })

    return attribute
}

const update = async (id, data) => {
    return await prisma.productAttribute.update({
        where: {
            id
        },
        data
    })
}

const remove = async (id) => {
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