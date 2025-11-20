const multer = require('multer')

// Set uploaded image locally (example)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');
    },
    filename: (res, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

module.exports = {
    storage
}