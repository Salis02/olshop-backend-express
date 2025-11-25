const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const eventController = require('../controllers/event.controller')

router.get('/', authMiddleware, eventController.getAllEvent)
router.get('/:id', authMiddleware, eventController.getOneEvent)
router.post('/', authMiddleware, eventController.createEvent)
router.put('/:id', authMiddleware, eventController.updateEvent)
router.delete('/:id', authMiddleware, eventController.removeEvent)

module.exports = router