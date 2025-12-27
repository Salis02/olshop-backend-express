const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const activityController = require('../controllers/activity.controller')
const allowRoles = require('../middlewares/role.middleware')

router.get('/', authMiddleware, allowRoles('ADMIN'), activityController.listActivityLog)

module.exports = router