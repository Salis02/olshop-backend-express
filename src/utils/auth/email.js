const { Resend } = require('resend');

// Inisialisasi Resend dengan API Key dari .env
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async (to, subject, html) => {
    try {
        // Fallback: Jika tidak ada API Key atau di mode Development tanpa Key
        if (!resend || process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
            console.log("=================================================");
            console.log("          EMAIL SIMULATION (RESEND DEV)          ");
            console.log("=================================================");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log("--- HTML Content ---");
            console.log(html);
            console.log("=================================================");
            return;
        }

        const { data, error } = await resend.emails.send({
            from: process.env.SMTP_FROM || 'onboarding@resend.dev', // Jika domain belum verif, pakai default resend
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend API Error => ", error);
            throw error;
        }

        console.log("Email sent via Resend: ", data.id);
    } catch (err) {
        console.error("Email sending error => ", err.message);
        throw err;
    }
}

const baseTemplate = (title, content) => {
    return `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #333;">${title}</h2>
        ${content}
        <p style="margin-top: 20px; font-size: 0.8em; color: #888;">
            Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
        </p>
    </div>`
}

const forgotPasswordTemplate = (token) => {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    return baseTemplate(
        "RESET PASSWORD",
        `
        <p>Klik link berikut untuk reset password Anda:</p>
        <a href="${url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>Atau copy link ini: <br> ${url}</p>
        <p>Link ini expired dalam ${process.env.RESET_TOKEN_EXPIRE_MINUTES} menit.</p>
        `
    );
}

const verifyAccountTemplate = (token) => {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-account?token=${token}`;
    return baseTemplate(
        "VERIFICATION ACCOUNT",
        `
        <p>Selamat bergabung! Silakan verifikasi akun Anda untuk mulai berbelanja:</p>
        <a href="${url}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verifikasi Sekarang</a>
        <p>Atau copy link ini: <br> ${url}</p> 
        `
    );
}

module.exports = {
    sendEmail,
    forgotPasswordTemplate,
    verifyAccountTemplate
}