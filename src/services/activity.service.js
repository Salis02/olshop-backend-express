const prisma = require('../prisma/client')
const { parsePaginationParams, buildPaginationResponse } = require('../utils/pagination');
const { buildSearchQuery } = require('../utils/search');

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

const list = async (query = {}) => {
    const { page, limit, skip } = parsePaginationParams(query);
    const { search } = query;

    const where = {};
    if (search) {
        Object.assign(where, buildSearchQuery(search, ['action', 'target_type']));
    }

    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            orderBy: {
                created_at: 'desc'
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
            },
            skip,
            take: limit
        }),
        prisma.activityLog.count({ where })
    ]);

    return buildPaginationResponse(page, limit, total, logs);
}

module.exports = { list, create }