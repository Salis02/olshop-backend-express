const crypto = require('crypto')

const generateResetToken = () => {
    return crypto.randomBytes(12).toString('hex');
}

module.exports = { generateResetToken }