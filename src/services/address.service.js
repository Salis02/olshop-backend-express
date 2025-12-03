const prisma = require('../prisma/client');

const getAddressesByUserId = async (userId) => {
    return await prisma.address.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
    })
}

const createAddress = async (userId, data, actor) => {
    const address = await prisma.address.create({
        data: { ...data, user_id: userId },
    })

    await log.create({
        user_id: actor.uuid,
        action: `Created new address with id ${address.id}`,
        target_type: "Address",
        target_id: address.id,
        meta: {
            ...data
        }
    })

    return address;

}

const updateAddress = async (id, userId, data, actor) => {
    const address = await prisma.address.findUnique({
        where: { id }
    });

    if (!address || address.user_id !== userId) {
        throw new Error('Address not found or unauthorized');
    }

    await log.create({
        user_id: actor.uuid,
        action: `Updated address with id ${id}`,
        target_type: "Address",
        target_id: id,
        meta: {
            ...data
        }
    })

    return await prisma.address.update({
        where: { id },
        data,
    });

}

const deleteAddress = async (id, userId, actor) => {
    const address = await prisma.address.findUnique({
        where: { id }
    });
    if (!address || address.user_id !== userId) {
        throw new Error('Address not found or unauthorized');
    }

    await log.create({
        user_id: actor.uuid,
        action: `Deleted address with id ${id}`,
        target_type: "Address",
        target_id: id,
    })

    return await prisma.address.delete({
        where: { id }
    });
}

module.exports = {
    getAddressesByUserId,
    createAddress,
    updateAddress,
    deleteAddress,
};