const { sanitizeObject } = require('./sanitize');

const validateRequest = (schema, data) => {
    // Sanitize input first
    const sanitized = sanitizeObject(data);

    const result = schema.safeParse(sanitized);
    if (!result.success) {
        throw new Error(result.error.errors[0].message);
    }
    return result.data;
};

module.exports = { validateRequest };
