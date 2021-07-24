const Subscription = require("../models/subscription");
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes');
const Property = require("../models/property");

exports.newSubscription = async (req, res) => {
    try {
        const { tenant  , property } = req.body;
        let checkTenant = await User.findOne({ email: tenant, role: "tenant" });
        if (!checkTenant) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: true,
                message: "user not found or role mismatch",
            })
          }
     req.body.tenant = checkTenant._id ;
        let newSubscription = await new Subscription(req.body).save();
        let propertyInfo = await Property.findOneAndUpdate({_id : property} , {subscription : newSubscription._id},{new : true})
        await User.findOneAndUpdate({ email: tenant }, { subscription: newSubscription._id , regions : [propertyInfo.region] },{new : true});
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Subscription successful",
            property : property,
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
        await User.findOneAndUpdate({ _id: subscription._id }, { subscription: null })
        await Property.findOneAndUpdate({_id : subscription._id} , {subscription : newSubscription._id})
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

