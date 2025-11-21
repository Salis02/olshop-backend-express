const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')
const productImageController = require('../controllers/productImage.controller')
const { error } = require('../utils/response');
const multer = require('multer')

// Upload and validation multer
const handleMulter = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            let message = 'Something wrong when upload file'
            let statusCode = 400;

            // If error is from multer
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    message = 'Your file is too large. File max size is 5MB'
                }
            } else if (err.message === 'File type not allowed') {
                message = 'File type not allowed. Only accept JPEG, PNG, JPG, and WEBP';
            } else {
                message = err.message || 'Error when trying to process file'
            }
            return error(res, message, statusCode)
        }

        // Contine to middleware/controller if not error
        next()
    })
}

router.post('/', authMiddleware, handleMulter, productImageController.uploadProductImage)
router.put('/:imageId/set-primary', authMiddleware, productImageController.setPrimary)
router.delete('/:imageId', authMiddleware, productImageController.removeProductImage)

module.exports = router