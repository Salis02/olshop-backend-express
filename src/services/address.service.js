const prisma = require('../prisma/client');
const { validateRequest } = require('../utils/validate')
const { addressCreateSchema, addressUpdateSchema } = require('../validators/address.validator.js');

const getAddressesByUserId = async (userId) => {
    return await prisma.address.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
    })
}

const createAddress = async (userId, data, actor) => {

    const payload = validateRequest(addressCreateSchema, data);

    if (payload.is_default) {
        // Set all other addresses to not default
        await prisma.address.updateMany({
            where: { user_id: userId, is_default: true },
            data: { is_default: false },
        })
    }

    const address = await prisma.address.create({
        data: {
            ...payload,
            user_id: userId
        },
    })

    await log.create({
        user_id: actor.uuid,
        action: `Created new address with id ${address.id}`,
        target_type: "Address",
        target_id: address.id,
        meta: {
            payload
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

    const payload = validateRequest(addressUpdateSchema, data);

    if (payload.is_default) {
        // Set all other addresses to not default
        await prisma.address.updateMany({
            where: { user_id: userId },
            data: { is_default: false },
        })
    }

    await log.create({
        user_id: actor.uuid,
        action: `Updated address with id ${id}`,
        target_type: "Address",
        target_id: id,
        meta: {
            payload
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