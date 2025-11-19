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
        const coupun = await couponService.getOne(req.param.id)
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
        return error(res, err.message)
    }
}

const updateCoupun = async (req, res) => {
    try {
        const coupun = await couponService.update(Number(req.param.id), req.body)
        return success(req, coupun, 'Coupun updated successfully', 200)
    } catch (err) {
        return error(res, err.message)
    }
}

const removeCoupun = async (req, res) => {
    try {
        const coupon = await couponService.remove(req.param.id)
        return success(res, coupon, 'Coupun removed successfully', 200)
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