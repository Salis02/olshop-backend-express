const { error } = require('../utils/response')

const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return error(res, "Unauthenticated", 401);
        }

        if (!roles.includes(req.user.role)) {
            return error(res, "Forbidden", 403);
        }

        next();
    };
};

module.exports = allowRoles