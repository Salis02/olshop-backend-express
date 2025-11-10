const express = require('express');
const prisma = require('../prisma/client.js');
const { success, error } = require('../utils/response.js');

const router = express.Router();

// Public route to get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { deleted_at: null },
            orderBy: { created_at: 'asc' },
        });
        return success(res, categories, 'Categories retrieved successfully', 200);
    } catch (err) {
        return error(res, err.message, 500);
    }
});

module.exports = router;