const multer = require('multer')
const path = require('path')

// Set uploaded image folder to locally (example)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');
    },
    filename: (res, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

// File extension validation
const fileFilter = (req, file, cb) => {
    const allowed = ['images/jpeg', 'images/jpg', 'images/png', 'image/webp'];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('File type not allowed'), false);
    }

    cb(null, true)
};

//Limit max 5mb
const limit = {
    fileSize: 5 * 1024 * 1024,
};

module.exports = {
    storage,
    fileFilter,
    limit
}