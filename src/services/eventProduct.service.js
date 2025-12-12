const prisma = require('../prisma/client')
const { createEventProductSchema } = require('../validators/eventProduct.validator')
const { validateRequest } = require('../utils/validate')
const AppError = require('../utils/AppError')

const create = async (event_id, data) => {

    const payload = validateRequest(createEventProductSchema, data)

    if (!payload.product_id) {
        throw new AppError("Product id is required", 422);
    }

    const event = await prisma.event.findUnique({
        where: { id: event_id }
    })

    const product = await prisma.product.findUnique({
        where: { uuid: payload.product_id }
    })

    if (!event && !product) throw new AppError("Event or product not found", 404);

    return await prisma.eventProduct.create({
        data: {
            event_id,
            product_id: payload.product_id,
            discount_value: payload.discount_value
        }
    })
}

const remove = async (id) => {
    const eventProduct = await prisma.eventProduct.findUnique({ where: { id } })

    if (!eventProduct) throw new AppError("Event Product not found", 404);

    return await prisma.eventProduct.delete({
        where: { id }
    })
}

const getByEvent = async (event_id) => {
    const event = await prisma.event.findUnique({
        where: {
            id: event_id
        }
    })

    if (!event) throw new AppError("Detail event for this product not found", 404);

    return await prisma.eventProduct.findMany({
        where: {
            event_id
        },
        include: {
            product: {
                select: {
                    uuid: true,
                    name: true,
                    slug: true,
                    price: true,
                    stock: true,
                    images: {
                        select: {
                            path: true
                        },
                        take: 1
                    }
                }
            }
        }
    })
}

module.exports = {
    create,
    remove,
    getByEvent
}