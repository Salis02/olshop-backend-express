const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return error(res, 'Authorization header missing', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === null) {
        return error(res, 'Token missing', 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
        req.user = decoded;
        next();
    } catch (err) {
        return error(res, 'Invalid or expired token', 401);
    }
}

module.exports = authMiddleware;
