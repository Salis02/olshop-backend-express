
const { sanitizeObject } = require('./sanitize');

const validateRequest = (schema, data) => {
    // Sanitize input first
    const sanitized = sanitizeObject(data);
    
    const result = schema.safeParse(sanitized);
    if (!result.success) {
            message = result.error.issues
                .map(err => `${ err.path.join('.') }: ${ err.message } `)
                .join(', ');
        } else if (result.error?.message) {
            message = result.error.message;
        }

        throw new Error(message);
    }

    return result.data;
};

module.exports = { validateRequest };
