const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const { validateRequest } = require('../utils/validate');
const log = require('../services/activity.service')
const { updateProfileSchema, updatePasswordSchema } = require('../validators/user.validator');
const { parsePaginationParams, buildPaginationResponse } = require('../utils/pagination');
const { buildSearchQuery } = require('../utils/search');

const getProfile = async (uuid) => {
    const user = await prisma.user.findUnique({
        where: { uuid },
        select: {
            uuid: true,
            name: true,
            email: true,
            phone: true,
            role: {
                select: {
                    name: true
                }
            },
            created_at: true,
        },
    })
    if (!user)
        throw new Error('User not found');
    return user
}

const getAllUser = async (query = {}) => {
    const { page, limit, skip } = parsePaginationParams(query);
    const { search } = query;

    const where = {};

    if (search) {
        Object.assign(where, buildSearchQuery(search, ['name', 'email', 'phone']));
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                uuid: true,
                name: true,
                email: true,
                password: false,
                phone: true,
                created_at: true,
                updated_at: true,
                role: {
                    select: {
                        name: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { created_at: 'desc' }
        }),
        prisma.user.count({ where })
    ]);

    return buildPaginationResponse(page, limit, total, users);
}

const updateProfile = async (uuid, data, actor) => {

    const { name, phone } = validateRequest(updateProfileSchema, data);

    const updatedUser = await prisma.user.update({
        where: { uuid },
        data: { name, phone },
        select: {
            uuid: true,
            name: true,
            email: true,
            phone: true,
        },
    })
    if (!updatedUser)
        throw new Error('User not found');

    await log.create({
        user_id: actor.uuid,
        action: "Update Profile",
        target_type: "User",
        target_id: uuid,
        meta: data
    })

    return updatedUser;
}

const updatePassword = async (uuid, data, actor) => {

    const { oldPassword, newPassword } = validateRequest(updatePasswordSchema, data);

    const user = await prisma.user.findUnique({ where: { uuid } })
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new Error('Old password is incorrect');

    const hashedOldPassword = await user.password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { uuid },
        data: { password: hashedNewPassword },
    });

    await log.create({
        user_id: actor.uuid,
        action: 'Update Password',
        target_type: 'User',
        target_id: uuid,
        meta: {
            message: 'Password updated successfully'
        }
    })

    return true;
}

const archieveUser = async (uuid, actor) => {

    if (uuid === actor.uuid) {
        throw new Error("You can't deactivate your own account");
    }

    const user = await prisma.user.findUnique({
        where: { uuid }
    })

    if (!user) throw new Error("User not found");

    if (user.deleted_at) throw new Error("User already archived");

    const archieve = await prisma.user.update({
        where: { uuid },
        data: {
            deleted_at: new Date()
        }
    })

    await log.create({
        user_id: actor.uuid,
        action: "Archieved user",
        target_type: "User",
        target_id: uuid,
        meta: {
            archieve_user_uuid: uuid
        }
    })

    return archieve
}

const restoreUser = async (uuid, actor) => {

    if (uuid === actor.uuid) {
        throw new Error("You can't restore your own account");
    }

    const user = await prisma.user.findUnique({
        where: { uuid }
    })

    if (!user) throw new Error("User not found");

    if (!user.deleted_at) throw new Error("User is active or not archieved");

    const archieve = await prisma.user.update({
        where: { uuid },
        data: {
            deleted_at: null
        }
    })

    await log.create({
        user_id: actor.uuid,
        action: "Restore/activated user",
        target_type: "User",
        target_id: uuid,
        meta: {
            archieve_user_uuid: uuid
        }
    })

    return archieve
}

module.exports = {
    getProfile,
    getAllUser,
    updateProfile,
    updatePassword,
    archieveUser,
    restoreUser
};