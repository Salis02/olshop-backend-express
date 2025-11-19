const prisma = require('../prisma/client')

const create = async (data) => {
    return prisma.coupon.create({ data })
}

const update = async (id, data) => {
    const exist = await prisma.coupon.findUnique({
        where: { id }
    })
    if (!exist) throw new Error("Coupun not found");

    return await prisma.coupon.update({
        where: {
            id
        },
        data
    })
}

const remove = async (id) => {
    return await prisma.coupon.delete({
        where: { id }
    })
}

const getAll = async () => {
    return await prisma.coupon.findMany()
}

const getOne = async (id) => {
    const coupon = prisma.coupon.findUnique({
        where: { id }
    })
    if (!coupon) throw new Error("Coupun not found");

}

const validateCoupun = async (code, user_id) => {
    const coupun = await prisma.coupon.findUnique({
        where: {
            code,
        }
    })
    if (!coupun) {
        throw new Error("Coupun invalid");
    }

    const now = new Date()

    if (now > coupun.expires_at) {
        throw new Error("Coupun expired");
    }

    return coupun
    // (Optional) cek kuota penggunaan user
    // const used = await prisma.order.count({
    //     where: { user_id, coupon_code: code }
    // })
    // if (used >= coupon.max_usage) throw new Error('Coupon usage limit reached')
}

module.exports = {
    create,
    update,
    remove,
    getAll,
    getOne,
    validateCoupun
}