const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware.js');
const addressController = require('../controllers/address.controller.js');

router.get('/', authMiddleware, addressController.list);
router.post('/', authMiddleware, addressController.create);
router.put('/:id', authMiddleware, addressController.update);
router.delete('/:id', authMiddleware, addressController.remove);

module.exports = router;