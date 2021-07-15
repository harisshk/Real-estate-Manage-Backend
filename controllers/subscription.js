const Subscription = require("../models/subscription");
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes');

exports.newSubscription = async (req, res) => {
    try {
        const { tenant } = req.body;
        let checkTenant = await User.findOne({ email: tenant, role: "tenant" });
        if (!checkTenant) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: true,
                message: "user not found or role mismatch",
            })
        }

        let newSubscription = await new Subscription(req.body).save();
        await User.findOneAndUpdate({ email: tenant }, { subscription: newSubscription._id });

        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Subscription successful",
        })
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            message: "Subscription Error",
            err: error.message
        })
    }

}

exports.updateSubscription = async (req, res) => {
    let { tenantId } = req.params;
    try {
        let subscription = await Subscription.findOneAndUpdate({ _id: tenantId }, { $set: req.body });
        await User.find({ _id: subscription._id }, { subscription: null })
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Subscription updated",
        })
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            message: "Subscription Error",
            err: error.message
        })
    }

}

