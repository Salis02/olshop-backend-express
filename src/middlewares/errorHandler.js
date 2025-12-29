const { AppError } = require('../utils/AppError')

module.exports = (err, req, res, next) => {
    // Log error for debugging
    console.error('Error Details:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Prisma unique constraint violation
    if (err.code === 'P2002') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'DUPLICATE_ENTRY',
                message: `${err.meta?.target ? err.meta.target.join(', ') : 'Field'} already exists`,
                details: process.env.NODE_ENV === 'development' ? err.meta : undefined
            },
            timestamp: new Date().toISOString()
        })
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: {
                code: 'RECORD_NOT_FOUND',
                message: 'Record not found'
            },
            timestamp: new Date().toISOString()
        })
    }

    // Prisma foreign key constraint
    if (err.code === 'P2003') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_REFERENCE',
                message: 'Invalid reference to related record'
            },
            timestamp: new Date().toISOString()
        })
    }

    // Custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.errorCode || 'APPLICATION_ERROR',
                message: err.message
            },
            timestamp: new Date().toISOString()
        })
    }

    // Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: err.errors
            },
            timestamp: new Date().toISOString()
        })
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            },
            timestamp: new Date().toISOString()
        })
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired'
            },
            timestamp: new Date().toISOString()
        })
    }

    // Default fallback - don't expose internal errors in production
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'development'
                ? err.message
                : 'An unexpected error occurred'
        },
        timestamp: new Date().toISOString()
    })
}