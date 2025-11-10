const success = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
}

const error = (res, message = 'Error', statusCode = 500) => {
    return res.status(statusCode).json({
        status: 'false',
        message
    });
}

module.exports = { success, error };