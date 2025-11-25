const eventService = require('../services/event.service')
const { success, error } = require('../utils/response')

const createEvent = async (req, res) => {
    try {
        const event = await eventService.create(req.body)
        return success(res, event, 'Event created successfully', 201)
    } catch (err) {
        return error(res, err.message)
    }
}

const updateEvent = async (req, res) => {
    try {
        const event = await eventService.update(Number(req.params.id), req.body)
        return success(res, event, 'Event updated successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const removeEvent = async (req, res) => {
    try {
        const event = await eventService.remove(Number(req.params.id))
        return success(res, event, 'Event updated successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const getAllEvent = async (req, res) => {
    try {
        const event = await eventService.getAll()
        return success(res, event, 'Event retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const getOneEvent = async (req, res) => {
    try {
        const event = await eventService.getOne(Number(req.params.id))
        return success(res, event, 'Event detail retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    createEvent,
    updateEvent,
    removeEvent,
    getAllEvent,
    getOneEvent
}