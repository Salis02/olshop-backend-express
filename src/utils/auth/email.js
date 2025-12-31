const nodemailer = require('nodemailer')

// Configurable transport based on environment variables
const createTransporter = () => {
    // 1. Console Log Strategy (Development / No SMTP)
    // Runs if explicitly in development OR if SMTP_PASS is missing/placeholder
    if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_PASS || process.env.SMTP_PASS.includes('123456'))) {
        return null;
    }

    // 2. SMTP Strategy (Resend, Gmail, etc)
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || process.env.GMAIL_USER,
            pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
        }
    })
}

const transporter = createTransporter();

const sendEmail = async (to, subject, html) => {
    try {
        // Fallback: If no transporter (Dev mode without SMTP), log to console
        if (!transporter) {
            console.log("=================================================");
            console.log("             EMAIL SIMULATION (DEV)              ");
            console.log("=================================================");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log("--- HTML Content ---");
            console.log(html);
            console.log("=================================================");
            return;
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"E-Commerce App" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log("Email sent: ", info.messageId)
    } catch (err) {
        console.error("Email sending error => ", err.message, err.response, err.responseCode, err);
        throw err
    }
}

const baseTemplate = (title, content) => {
    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #333;">${title}</h2>
        ${content}
        <p style="margin-top: 20px; font-size: 0.8em; color: #888;">
            Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
        </p>
    </div>`
}

const forgotPassword = (token) => {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return baseTemplate(
        "RESET PASSWORD",
        `
        <p>Klik link berikut untuk reset password Anda:</p>
        <a href="${url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>Atau copy link ini: <br> ${url}</p>
        <p>Link ini expired dalam ${process.env.RESET_TOKEN_EXPIRE_MINUTES} menit.</p>
        `
    )
}

const vedifyAccount = (token) => {
    const url = `${process.env.FRONTEND_URL}/verify-account?token=${token}`;
    return baseTemplate(
        "VERIFICATION ACCOUNT"
         `
            <p>Selamat bergabung! Silakan verifikasi akun Anda untuk mulai berbelanja:</p>
            <a href="${url}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verifikasi Sekarang</a>
            <p>Atau copy link ini: <br> ${url}</p>   
        `
    )
}

module.exports = { sendEmail }