const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');


router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

module.exports = router;