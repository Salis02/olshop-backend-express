const { da } = require("zod/locales");
const prisma = require("../prisma/client");

const getAll = async (productId) => {
    const variant = await prisma.productVariant.findMany({
        where: {
            product_id: productId
        }
    })

    return variant
}

const create = async (productId, data) => {
    const { name, price_adjustment, stock_adjustment } = data

    const variant = await prisma.productVariant.create({
        where: {
            product_id: productId,
            name,
            price_adjustment: price_adjustment || null,
            stock_adjustment: stock_adjustment || null
        }
    })
}

const update = async (id, data) => {
    return await prisma.productVariant.update({
        where: {
            id
        },
        data
    })
}

const remove = async (id) => {
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