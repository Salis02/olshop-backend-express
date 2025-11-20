const prisma = require('../prisma/client')

const createImage = async (product_uuid, path) => {
    const product = await prisma.product.findUnique({
        where: {
            uuid: product_uuid
        }
    })

    if (!product) throw new Error("Product not found");

    return await prisma.productImage.create({
        data: {
            product_id: product_uuid,
            path,
            is_primary: false
        }
    })
}

const deleteImage = async (id) => {
    const img = await prisma.productImage.findUnique({
        where: {
            id
        }
    })

    if (!img) throw new Error("Image not found");

    return await prisma.productImage.delete({
        where: {
            id
        }
    })
}

const setPrimary = async (id) => {
    const img = await prisma.productImage.findUnique({
        where: {
            id
        }
    })

    if (!img) throw new Error("Image not found");

    // Reset primary
    await prisma.productImage.updateMany({
        where: {
            product_id: img.product_id
        },
        data: {
            is_primary: false
        }
    })

    // Set new primary
    return await prisma.productImage.update({
        where: {
            id
        },
        data: {
            is_primary: true
        }
    })
}

module.exports = {
    createImage,
    deleteImage,
    setPrimary
}