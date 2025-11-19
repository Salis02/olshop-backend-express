const prisma = require('../prisma/client')

const add = async (user_id, product_id) => {
    const wishlist = await prisma.wishlist.findFirst({
        where: {
            user_id, product_id
        }
    })

    if (!wishlist) {
        throw new Error("Wishlist is already exist!");
    }

    return await prisma.wishlist.create({
        data: {
            user_id,
            product_id
        }
    })
}

const remove = async (user_id, product_id) => {
    return await prisma.wishlist.deleteMany({
        where: {
            user_id,
            product_id
        }
    })
}

const getUserWishlist = async (user_id) => {
    return await prisma.wishlist.findMany({
        where: {
            user_id,
        },
        include: {
            product: true
        },
        orderBy: {
            created_at: 'desc'
        }
    })
}

module.exports = {
    add,
    remove,
    getUserWishlist
}