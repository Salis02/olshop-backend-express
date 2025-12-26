// src/utils/sanitize.js

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return str;

    return str
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

module.exports = {
    sanitizeString,
    sanitizeObject
};
