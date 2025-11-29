const { error } = require('../utils/response')

const allowRoles = (...role) => {
    return (req, res, next) => {
        if (!req.user || !role.includes(req.user.role)) {
            return error(res, "Forbidden: You don't have permision", 403)
        }
        next()
    }
}

module.exports = allowRoles