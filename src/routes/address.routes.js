const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware.js');
const allowRoles = require('../middlewares/role.middleware.js')
const addressController = require('../controllers/address.controller.js');


router.use(
    authMiddleware,
    allowRoles('USER')
);

router.get('/', addressController.list);
router.post('/', addressController.create);
router.put('/:id', addressController.update);
router.delete('/:id', addressController.remove);

module.exports = router;