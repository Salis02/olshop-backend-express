const prisma = require('../prisma/client')

const create = async (data) => {
    // Generate slug
    data.slug = data.name.toLowerCase().replace(/ /g, '-')

    return await prisma.event.create({
        data
    })
}

const update = async (id, data) => {
    const exist = await prisma.event.findUnique({
        where: { id }
    })
    if (!exist) throw new Error("Event not found");

    if (data.name) {
        data.slug = data.name.toLowerCase().replace(/ /g, '-')
    }

    return await prisma.event.update({
        where: {
            id
        },
        data
    })
}

const remove = async (id) => {
    const event = await prisma.findUnique({
        where: {
            id
        }
    })

    if (!event) throw new Error("Event not found");

    return await prisma.event.update({
        where: {
            id
        },
        data: {
            deleted_at: new Date()
        }
    })
}

const getAll = async () => {
    return await prisma.event.findMany({
        where: {
            deleted_at: null
        }
    })
}

const getOne = async (id) => {
    const event = await prisma.event.findUnique({
        where: {
            id
        },
        include: {
            products: true
        }
    })

    if (!event) throw new Error("Event not found");
    return event
}

module.exports = {
    create,
    update,
    remove,
    getAll,
    getOne
}