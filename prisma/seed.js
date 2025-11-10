// import { PrismaClient } from '../src/generated/prisma-client';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

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

    //Admin User
    const adminUser = await prisma.user.create({
        data: {
            role_id: adminRole.id,
            name: 'Super Admin',
            email: 'admin@example.com',
            password: 'admin123',
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

    console.log('Seeding completed.');
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });