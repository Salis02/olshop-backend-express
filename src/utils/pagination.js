// src/utils/pagination.js

/**
 * Parse pagination parameters from query
 */
function parsePaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10)); // Max 100 per page
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Build pagination response
 */
function buildPaginationResponse(page, limit, total, data) {
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
}

module.exports = {
    parsePaginationParams,
    buildPaginationResponse
};
