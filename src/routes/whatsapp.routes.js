const express = require('express')
const router = express.Router()
const whatsappController = require('../controllers/whatapp.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const allowRoles = require('../middlewares/role.middleware')

router.post('/send', authMiddleware, allowRoles('ADMIN'), whatsappController.sendMessage)
router.post('/logout', authMiddleware, allowRoles('ADMIN'), whatsappController.logout)
router.post('/reset', authMiddleware, allowRoles('ADMIN'), whatsappController.reset)

module.exports = router