const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const registerUser = async ({ name, email, password, phone }) => {

    //Cek User sudah ada atau belum
    const existUser = await prisma.user.findUnique({
        where: { email }
    });

    //Jika ada, throw error
    if (existUser) {
        throw new Error('User already exists');
    }

    //Cek Role 'USER' dari tabel Role, default role untuk user baru
    const role = await prisma.role.findFirst({
        where: { name: 'USER' }
    });

    //Jika tidak ada, throw error
    if (!role) {
        throw new Error('Default role not found');
    }

    //Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Buat User baru
    const newUser = await prisma.user.create({
        data: {
            role_id: role.id,
            name,
            email,
            password: hashedPassword,
            phone,
        }
    });

    return { uuid: newUser.id, name: newUser.name, email: newUser.email };
}

const loginUser = async ({ email, password }) => {
    //Cari user berdasarkan email
    const user = await prisma.user.findUnique({
        where: { email }
    });
    //Jika user tidak ditemukan, throw error
    if (!user) {
        throw new Error('Invalid email or password');
    }

    //Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    //Generate JWT Token
    const token = generateToken({ uuid: user.id, role_id: user.role_id });

    return {
        token,
        user: {
            uuid: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
        }
    }
}

module.exports = { registerUser, loginUser };