const whatsappService = require('../services/whatsapp.service')
const { success, error } = require('../utils/response')
const { serializeMessage } = require('../utils/helper')

const sendMessage = async (req, res) => {
    try {
        const { number, message } = req.body

        const result = await whatsappService.sendMessage(number, message)

        return success(res, serializeMessage(result), 'Message sent successfully', 200)
    } catch (err) {
        return error(res, err.message, 400)
    }
}

const logout = async (req, res) => {
    try {
        const data = await whatsappService.logout()
        return success(res, data, 'Logout successfully')
    } catch (err) {
        return error(res, err.message)
    }
}

const reset = async (req, res) => {
    try {
        const data = await whatsappService.reset()
        return success(res, data, 'Reset successfully')
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    sendMessage,
    logout,
    reset
}