// import { PrismaClient } from '../src/generated/prisma-client';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {

    console.log('🌱 Seeding database...');

    //Hapus data lama
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.category.deleteMany();

    //Roles
    const adminRole = await prisma.role.create({
        data: {
            name: 'ADMIN',
            description: 'Administrator with full access',
        },
    })

    const userRole = await prisma.role.create({
        data: {
            name: 'USER',
            description: 'Regular user with limited access',
        },
    })

    //Hash password for admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    //Admin User
    const adminUser = await prisma.user.create({
        data: {
            role_id: adminRole.id,
            name: 'Super Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            phone: '081227209872',
            email_verified_at: new Date()
        }
    })

    //Categories sample
    const categories = await prisma.category.createMany({
        data: [
            { name: 'Electronics', slug: 'electronics' },
            { name: 'Books', slug: 'books' },
            { name: 'Clothing', slug: 'clothing' },
        ],
    })

    console.log('✅ Seeding completed successfully.');
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });