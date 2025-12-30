// src/config/env.js
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'PORT',
    'NODE_ENV'
];

const optionalEnvVars = [
    'FRONTEND_URL',
    'APP_URL',
    'RESEND_API_KEY',
    'APP_EMAIL',
    'RESET_TOKEN_EXPIRE_MINUTES',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_SECURE',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM'
];

function validateEnv() {
    const missing = [];

    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    });

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n  - ${missing.join('\n  - ')}\n` +
            `Please check your .env file.`
        );
    }

    // Set defaults for optional vars
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    process.env.APP_URL = process.env.APP_URL || 'http://localhost:5000';
    process.env.RESET_TOKEN_EXPIRE_MINUTES = process.env.RESET_TOKEN_EXPIRE_MINUTES || '15';

    console.log('✅ Environment variables validated successfully');
}

module.exports = { validateEnv };
