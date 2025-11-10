const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient({
//     log: ['query', 'info', 'warn', 'error'],
// });

const prisma = new PrismaClient();

module.exports = prisma;