const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/auth/jwt');
const { rateLimitLogin, resetLoginAttempt, rateLimitRegister } = require('../utils/security/rateLimiter')
const { validateRequest } = require('../utils/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { generateResetToken } = require('../utils/auth/generateToken');
const { sendEmail } = require('../utils/auth/email');
const {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError
} = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/auth/jwt');
const { rateLimitLogin, resetLoginAttempt, rateLimitRegister } = require('../utils/security/rateLimiter')
const { validateRequest } = require('../utils/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { generateResetToken } = require('../utils/auth/generateToken');
const { sendEmail } = require('../utils/auth/email');

const registerUser = async (data, ip) => {

    try {
        rateLimitRegister(ip)
    } catch (err) {
        throw new Error(err.message);
    }

    //Validate input data
    const { name, email, password, phone } = validateRequest(registerSchema, data);

    //Cek User sudah ada atau belum
    const existUser = await prisma.user.findUnique({
        where: { email }
    });

    //Jika ada, throw error
    if (existUser) {
        throw new ConflictError('User or email already exists');
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

    return {
        uuid: newUser.uuid,
        name: newUser.name,
        email: newUser.email
    };
}

const loginUser = async (data, ip) => {

    try {
        rateLimitLogin(ip);
    } catch (err) {
        throw new Error(err.message);
    }

    //Validate input data
    const { email, password } = validateRequest(loginSchema, data);

    //Cari user berdasarkan email
    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });

    //Jika user tidak ditemukan, throw error
    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    if (user.deleted_at !== null) {
        throw new ForbiddenError("Account is deleted");
    }

    //Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
    }

    resetLoginAttempt(ip)

    //Generate JWT and Refresh Token
    const payload = {
        uuid: user.uuid,
        email: user.email,
        role: user.role.name
    }

    const accessToken = generateToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Save new token
    await prisma.user.update({
        where: { uuid: user.uuid },
        data: { remember_token: refreshToken }
    })

    return {
        accessToken,
        refreshToken,
        user: {
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            role_name: user.role.name
        }
    }
}

const refreshTokenService = async (refreshToken) => {

    if (!refreshToken) throw new UnauthorizedError("Refresh token required");

    const payload = verifyRefreshToken(refreshToken)

    if (!payload) throw new UnauthorizedError("Invalid or expired refresh token!");

    const user = await prisma.user.findUnique({
        where: { uuid: payload.uuid }
    })

    if (!user || user.remember_token !== refreshToken) throw new UnauthorizedError("Refresh token not found");

    const newpayload = {
        uuid: user.uuid,
        email: user.email,
        role: user.role.name
    }

    const newAccessToken = generateToken(newpayload)
    const newRefreshToken = generateRefreshToken(newpayload)

    // Rotation : change old token with new one
    await prisma.user.update({
        where: { uuid: user.uuid },
        data: { remember_token: newRefreshToken }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}

const logoutUser = async (user_id) => {
    const user = await prisma.user.findUnique({
        where: { uuid: user_id }
    })

    if (!user) throw new NotFoundError("User not found");

    await prisma.user.update({
        where: { uuid: user_id },
        data: { remember_token: null }
    })
}

const forgotPassword = async (email) => {

    // Search user's email
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) return true // Don't explain that user is not registered

    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + process.env.RESET_TOKEN_EXPIRE_MINUTES * 60 * 1000)

    // Save token
    await prisma.passwordReset.create({
        data: {
            email,
            token,
            expires_at: expiresAt
        }
    })

    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`

    await sendEmail(
        email,
        "Reset password TEST",
        "<p>Hello this is a reset password test email without URL.</p>"
    );


    // await sendEmail(
    //     email,
    //     `Reset password`,
    //     `
    //         <h3>Password Reset</h3>
    //         <p>Klik link berikut :</p>
    //         <a href="${resetUrl}" >${resetUrl}</a>
    //         <p>Expired dalam ${process.env.RESET_TOKEN_EXPIRE_MINUTES} menit</p>
    //     `
    // )

    return true
}

const resetPassword = async (token, newPassword) => {
    const record = await prisma.passwordReset.findUnique({
        where: {
            token
        }
    })

    if (!record || record.used) throw new ValidationError("Invalid or used token");

    if (new Date() > record.expires_at) throw new ValidationError("Token expired")

    const newHashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: {
            email: record.email
        },
        data: {
            password: newHashedPassword
        }
    })

    await prisma.passwordReset.update({
        where: {
            token
        },
        data: {
            used: true
        }
    })

    return true
}

module.exports = {
    registerUser,
    loginUser,
    refreshTokenService,
    logoutUser,
    forgotPassword,
    resetPassword
};