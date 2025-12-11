const express = require('express')
const router = express.Router()
const whatsappController = require('../controllers/whatapp.controller')

router.post('/send', whatsappController.sendMessage)
router.post('/logout', whatsappController.logout)
router.post('/reset', whatsappController.reset)

module.exports = router