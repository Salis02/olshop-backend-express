const AppError = require('../utils/AppError')

module.exports = (err, req, res, next) => {
    console.error('Global Error:', err)

    // Prisma know error
    if (err.code === 'P2002') {
        return res.status(400).json({
            status: 'error',
            message: `${err.meta.target} already exists`
        })
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            status: 'error',
            message: 'Record not found'
        })
    }

    // Custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        })
    }

    // Default fallback
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    })
}