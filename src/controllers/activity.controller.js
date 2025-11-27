const activity = require('../services/activity.service')
const { success } = require('../utils/response')

const listActivityLog = async (req, res, next) => {
    const Log = await activity.list()
    return success(res, log, 'Activity log retrieved successfully', 200)
}

module.exports = { listActivityLog }