const prisma = require('../prisma/client')

const create = async ({ user_id, action, target_type, target_id, meta }) => {
    return prisma.activityLog.create({
        data: {
            user_id,
            action,
            target_type,
            target_id,
            meta
        }
    });
};

const list = () => {
    return prisma.activityLog.findMany({
        orderBy: {
            created_at: 'asc'
        },
        include: {
            user: {
                select: {
                    name: true,
                    role: {
                        select: {
                            name: true,
                        }
                    }
                }
            }
        }
    })
}

module.exports = { list, create }