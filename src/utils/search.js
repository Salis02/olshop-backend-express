/**
 * Build search query for Prisma
 * @param {string} search - Search query string
 * @param {string[]} fields - Array of fields to search in
 * @returns {object} - Prisma where clause object
 */
const buildSearchQuery = (search, fields = ['name']) => {
    if (!search) return {};

    const searchCondition = {
        contains: search,
        mode: 'insensitive'
    };

    if (fields.length === 1) {
        return {
            [fields[0]]: searchCondition
        };
    }

    return {
        OR: fields.map(field => ({
            [field]: searchCondition
        }))
    };
};

module.exports = {
    buildSearchQuery
};
