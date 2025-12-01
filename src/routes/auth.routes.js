const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const { sendEmail } = require('../utils/email.js')


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)
router.get('/test-email', async (req, res) => {
    try {
        await sendEmail(
            process.env.GMAIL_USER,
            "Test Email",
            "<p>This is a test.</p>"
        )
        res.json("OK")
    } catch (err) {
        res.json(err.message)
    }
})


module.exports = router;