const prisma = require('../prisma/client')

const log = async (user_id, action, target_type, target_id, meta = {}) => {
    return await prisma.activityLog.create({
        data: {
            user_id,
            action,
            target_type,
            target_id,
            meta
        }
    })
}

const list = async () => {
    return await prisma.activityLog.findMany({
        orderBy: {
            created_at: 'asc'
        },
        include: {
            user: true
        }
    })
}

module.exports = { log, list }