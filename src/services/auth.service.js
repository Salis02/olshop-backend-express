const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

    // Decode refresh token to get expiration time for DB
    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // Save new token to RefreshToken table
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            user_id: user.uuid,
            user_agent: ip.userAgent || null,
            ip_address: typeof ip === 'string' ? ip : ip.ip,
            expires_at: expiresAt
        }
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

const refreshTokenService = async (refreshToken, ipData = {}) => {

    if (!refreshToken) throw new UnauthorizedError("Refresh token required");

    // 1. Find token in DB
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: { include: { role: true } } }
    })

    // 2. Security Check: Token Reuse Detection or Invalid Token
    if (!tokenRecord) {
        throw new UnauthorizedError("Invalid refresh token (Reuse detected or not found)");
    }

    // 3. Check Expiry
    if (new Date() > tokenRecord.expires_at) {
        // Delete expired token
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
        throw new UnauthorizedError("Refresh token expired");
    }

    const user = tokenRecord.user;

    const newpayload = {
        uuid: user.uuid,
        email: user.email,
        role: user.role.name
    }

    const newAccessToken = generateToken(newpayload)
    const newRefreshToken = generateRefreshToken(newpayload)

    // Calculate new expiry
    const decoded = jwt.decode(newRefreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // 4. Token Rotation: Delete old, Create new
    // Transaction to ensure atomicity
    await prisma.$transaction([
        prisma.refreshToken.delete({
            where: { id: tokenRecord.id }
        }),
        prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                user_id: user.uuid,
                user_agent: ipData.userAgent || tokenRecord.user_agent,
                ip_address: ipData.ip || tokenRecord.ip_address,
                expires_at: expiresAt
            }
        })
    ]);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}

const logoutUser = async (refreshToken) => {
    if (!refreshToken) return; // Nothing to logout if no token provided

    // Delete the specific refresh token session
    // We use deleteMany to avoid error if token not found (idempotent-ish)
    // or findUnique then delete. deleteMany is safer if key constraint exists but we want to be loose.
    // 'token' is unique, so delete is fine. catch error if not found.
    try {
        await prisma.refreshToken.delete({
            where: { token: refreshToken }
        })
    } catch (e) {
        // Ignore if token not found, maybe already logged out
    }
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
        `Reset password`,
        `
            <h3>Password Reset</h3>
            <p>Klik link berikut untuk reset password Anda:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}" target="_blank">Reset Password</a>
            <p>Atau copy link ini: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}</p>
            <p>Link ini expired dalam ${process.env.RESET_TOKEN_EXPIRE_MINUTES} menit.</p>
        `
    )

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