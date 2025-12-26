const success = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

const error = (res, message, statusCode = 500, errorCode = 'ERROR') => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message
        },
        timestamp: new Date().toISOString()
    });
};

const paginated = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    success,
    error,
    paginated
};