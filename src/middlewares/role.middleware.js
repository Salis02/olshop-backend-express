const { error } = require('../utils/response')

const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return error(res, "Forbidden: You don't have permision", 403)
        }
        next()
    }
}

module.exports = allowRoles