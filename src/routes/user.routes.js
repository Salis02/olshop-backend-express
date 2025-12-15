const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware.js');
const allowRoles = require('../middlewares/role.middleware.js')
const userController = require('../controllers/user.controller.js');

router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/change-password', authMiddleware, userController.changeUserPassword);

// Route admin
router.get('/users', authMiddleware, allowRoles('ADMIN'), userController.getAllUser);
router.put('/:id/archieve', authMiddleware, allowRoles('ADMIN'), userController.archieveUser);
router.put('/:id/restore', authMiddleware, allowRoles('ADMIN'), userController.restoreUser);

module.exports = router;