const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async (to, subject, html) => {
    try {
        await resend.emails.send({
            from: 'Acme < onboarding@resend.dev > ',
            to,
            subject,
            html
        })
        return true
    } catch (err) {
        console.error("Email error => ", err?.response?.data ?? err);
        throw new Error("Failed to send email");
    }

}

module.exports = { sendEmail }