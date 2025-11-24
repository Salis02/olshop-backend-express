const validateRequest = (schema, data) => {
    const result = schema.safeParse(data);

    if (!result.success) {
        let message = 'Validation error occurred';

        if (result.error && Array.isArray(result.error.errors)) {
            // Ambil pesan dari setiap field error
            message = result.error.errors
                .map(err => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
        } else if (result.error?.issues) {
            // fallback ke struktur issues
            message = result.error.issues
                .map(err => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
        } else if (result.error?.message) {
            message = result.error.message;
        }

        throw new Error(message);
    }

    return result.data;
};

module.exports = { validateRequest };
