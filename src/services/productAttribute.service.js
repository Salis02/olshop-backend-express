const prisma = require('../prisma/client')

const getAll = async (productId) => {
    const variant = await prisma.productAttribute.findMany({
        where: {
            product_id: productId
        }
    })

    if (!variant) throw new Error("Attribute product not found");

    return variant
}

const create = async (productId, data) => {
    const { key, value } = data

    
}