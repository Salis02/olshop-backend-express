const midtransClient = require('midtrans-client')

const snap = new midtransClient.Snap({
    // isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    serverKey: process.env.SERVER_KEY || '',
    clientKey: process.env.CLIENT_KEY || ''
})

module.exports = {
    snap
}