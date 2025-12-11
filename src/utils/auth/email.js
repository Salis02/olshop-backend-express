const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
})

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"E-Commerce App" <${process.env.GMAIL_USER}> `,
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

module.exports = { sendEmail }