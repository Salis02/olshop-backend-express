const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const { validateRequest } = require('../utils/validate');
const { updateProfileSchema, updatePasswordSchema } = require('../validators/user.validator');

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

const updateProfile = async (uuid, data) => {

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
    return updatedUser;
}

const updatePassword = async (uuid, data) => {

    const { oldPassword, newPassword } = validateRequest(updatePasswordSchema, data);

    const user = await prisma.user.findUnique({ where: { uuid } })
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new Error('Old password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { uuid },
        data: { password: hashedPassword },
    });
    return true;
}

module.exports = { getProfile, updateProfile, updatePassword };