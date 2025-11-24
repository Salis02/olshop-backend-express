const couponService = require('../services/coupun.service')
const { success, error } = require('../utils/response')

const getAllCoupun = async (req, res) => {
    try {
        const coupun = await couponService.getAll()
        return success(res, coupun, 'Coupun retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const getOneCoupun = async (req, res) => {
    try {
        const coupun = await couponService.getOne(Number(req.params.id))
        return success(res, coupun, 'One coupun retrieved successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const createCoupun = async (req, res) => {
    try {
        const coupon = await couponService.create(req.body)
        return success(res, coupon, 'Coupun created successfully', 201)
    } catch (err) {
        return error(res, err.message, 400)
    }
}

const updateCoupun = async (req, res) => {
    try {
        const coupun = await couponService.update(Number(req.params.id), req.body)
        return success(res, coupun, 'Coupun updated successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const removeCoupun = async (req, res) => {
    try {
        await couponService.remove(Number(req.params.id))
        return success(res, null, 'Coupun removed successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

module.exports = {
    getAllCoupun,
    getOneCoupun,
    createCoupun,
    updateCoupun,
    removeCoupun
}