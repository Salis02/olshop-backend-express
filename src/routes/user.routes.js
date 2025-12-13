const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware.js');
const allowRoles = require('../middlewares/role.middleware.js')
const userController = require('../controllers/user.controller.js');

router.get('/profile', authMiddleware, userController.getUserProfile);
router.get('/users', authMiddleware, userController.getAllUser);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/change-password', authMiddleware, userController.changeUserPassword);
router.put('/:id/archieve', allowRoles('ADMIN'), authMiddleware, userController.archieveUser);
router.put('/:id/restore', allowRoles('ADMIN'), authMiddleware, userController.restoreUser);

module.exports = router;