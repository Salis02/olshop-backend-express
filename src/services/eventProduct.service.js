const prisma = require('../prisma/client')

const create = async (event_id, data) => {
    const event = await prisma.event.findUnique({
        where: { id: event_id }
    })

    const product = await prisma.product.findUnique({
        where: { uuid: data.product_id }
    })

    if (!event && !product) throw new Error("Event or product not found");

    return await prisma.eventProduct.create({
        data: {
            event_id,
            product_id: data.product_id,
            discount_value: data.discount_value
        }
    })
}

const remove = async (id) => {
    const eventProduct = await prisma.eventProduct.findUnique({ where: id })

    if (!eventProduct) throw new Error("Event Product not found");

    return await prisma.eventProduct.delete({
        where: { id }
    })
}

const getByEvent = async (event_id) => {
    const eventProduct = await prisma.eventProduct.findUnique({
        where: {
            id: event_id
        }
    })

    if (!eventProduct) throw new Error("Detail event for this product not found");

    return await prisma.eventProduct.findMany({
        where: {
            id: event_id
        },
        include: {
            product: true
        }
    })
}

module.exports = {
    create,
    remove,
    getByEvent
}