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
        // Don't throw error in dev to avoid blocking flow, but good to know
        if (process.env.NODE_ENV !== 'development') {
            throw err
        }
    }
}

module.exports = { sendEmail }