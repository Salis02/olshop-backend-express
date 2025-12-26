// src/utils/inventory.js

const prisma = require('../prisma/client');

const LOW_STOCK_THRESHOLD = 10; // Configure as needed

/**
 * Get products with low stock
 */
async function getLowStockProducts(threshold = LOW_STOCK_THRESHOLD) {
    return await prisma.product.findMany({
        where: {
            stock: {
                lte: threshold
            },
            deleted_at: null,
            status: 'active'
        },
        select: {
            uuid: true,
            name: true,
            sku: true,
            stock: true,
            category: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            stock: 'asc'
        }
    });
}

/**
 * Check if product is low stock
 */
function isLowStock(stock, threshold = LOW_STOCK_THRESHOLD) {
    return stock <= threshold;
}

module.exports = {
    getLowStockProducts,
    isLowStock,
    LOW_STOCK_THRESHOLD
};
