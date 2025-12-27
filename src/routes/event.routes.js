const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const eventController = require('../controllers/event.controller')
const allowRoles = require('../middlewares/role.middleware')

router.get('/', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), eventController.getAllEvent)
router.get('/:id', authMiddleware, allowRoles('USER', 'SELLER', 'ADMIN'), eventController.getOneEvent)
router.post('/', authMiddleware, allowRoles('ADMIN'), eventController.createEvent)
router.put('/:id', authMiddleware, allowRoles('ADMIN'), eventController.updateEvent)
router.delete('/:id', authMiddleware, allowRoles('ADMIN'), eventController.removeEvent)

module.exports = router