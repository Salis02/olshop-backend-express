const prisma = require('../prisma/client')

const creteShipment = async (order_id, data) => {
    const { courier, tracking_number } = data

    const order = await prisma.order.findUnique({
        where: {
            uuid: order_id
        }
    })

    if (!order) {
        throw new Error('Order not found')
    }

    const shipment = await prisma.shipment.create({
        data: {
            order_id,
            courier,
            tracking_number,
            status: 'pending'
        }
    })

    // Update order fulfillment_status => 'processing
    await prisma.order.update({
        where: {
            uuid: order_id
        },
        data: {
            fulfillment_status: 'processing'
        }
    })

    return shipment
}

const getShipments = async (user_id) => {
    return await prisma.shipment.findMany({
        where: {
            order: { user_id }
        },
        include: {
            order_id: true,
        },
        orderBy: {
            created_at: 'desc'
        }
    })
}

const updateShipmentStatus = async (id, status) => {
    const shipment = await prisma.shipment.findUnique({
        where: {
            id
        }
    })

    if (!shipment) {
        throw new Error("Shipment not found");
    }

    const data = { status }
    if (status === 'shipped') data.shipped_at = new Date()
    if (status === 'delivered') data.delivered_at = new Date()

    const updated = await prisma.shipment.update({
        where: { id },
        data
    })

    //Syncronizing with order
    let orderStatus = 'processing'
    if (status === 'shipped') orderStatus = 'shipped'
    if (status === 'delivered') orderStatus = 'delivered'
    if (status === 'cancelled') orderStatus = 'cancelled'

    await prisma.order.update({
        where: {
            uuid: shipment.order_id
        },
        data: {
            fulfillment_status: orderStatus
        }
    })

    return updated
}

module.exports = [
    creteShipment,
    getShipments,
    updateShipmentStatus,
]