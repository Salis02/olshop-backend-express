const upload = require('../middlewares/upload.middleware')
const multer = require('multer')
const { error } = require('../utils/response');

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

const normalizeImage = (product, baseUrl) => {
    if (!product.images) return product;

    return {
        ...product,
        images: product.images.map(img => {
            const norm = img.path.replace(/\\/g, '/');
            return {
                ...img,
                path: norm,
                url: `${baseUrl}/${norm}`
            };
        })
    };
};

const serializeMessage = (msg) => {
    return {
        message_id: msg.id._serialized,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp,
        ack: msg.ack // 0 sent, 1 delivered to server, 2 delivered to phone, 3 read
    }
}

const waitUntilReady = async (client) => {
    if (client.info && client.info.wid) return true;

    return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("WhatsApp is not ready")), 15000);

        client.once("ready", () => {
            clearTimeout(timeout);
            resolve(true);
        });
    });
};


module.exports = {
    normalizeImage,
    serializeMessage,
    waitUntilReady,
    handleMulter
}