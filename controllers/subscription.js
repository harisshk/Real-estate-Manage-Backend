const Subscription = require("../models/subscription");
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes');
const Property = require("../models/property");
const { sendMail } = require("../methods/nodemailer");
const SubProperty = require("../models/subProperty");

exports.newSubscription = async (req, res) => {
    try {
        const { tenant  , property } = req.body;
        let checkTenant = await User.findOne({ email: tenant, role: "tenant" });
        if (!checkTenant || checkTenant.role !== "tenant") {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: true,
                message: "user not found or role mismatch",
            })
        }
        if(checkTenant.subscription){
            return res.status(StatusCodes.BAD_REQUEST).json({
                error : true ,
                message : "tenant already in use"
            })
        }
        req.body.tenant = checkTenant._id ;
        let newSubscription = await new Subscription(req.body).save();
        // let subscriptionExists = await 
        let propertyInfo = await SubProperty.findOneAndUpdate({ _id: property }, { $push: { subscription: newSubscription._id }, currentSubscription: newSubscription._id, isOccupied: true }, { new: true }).populate("parentId")
        await User.findOneAndUpdate({ email: tenant }, { subscription: newSubscription._id , regions : [propertyInfo.parentId.region] },{new : true});
        let body = `Tenant ${checkTenant.name} as assigned to Property ${propertyInfo.name}`;
        let subject = `Tenant Assigned`;
        let allAdmins = await User.find({role : "admin" , isActive : false});
        // for(let i = 0 ; i < allAdmins.length ; i++){
        //     sendMail(allAdmins[i].email, subject ,body);
        // }
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Subscription successful",
            property : property,
            subscription : newSubscription._id
        })
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            message: "Subscription Error",
            err: error.message
        })
    }

}

exports.reassignSubscription = async (req,res) => {
    try {
        const { tenant  , property } = req.body;
        const propertyInfo = await SubProperty.findOneAndUpdate({_id : property},{$set : {currentSubscription : null,isOccupied:false}}).populate("parentId");
        const subscriptionInfo = await Subscription.findByIdAndUpdate({_id : propertyInfo.currentSubscription},{$set : {isActive: false}});
        await User.findOneAndUpdate({ _id: subscriptionInfo.tenant }, { $set: { subscription: null, regions: [] } });
        const newSubscriptionInfo = await new Subscription({
            tenant: tenant,
            property: property
        }).save();
        const newTenantInfo = await User.findOneAndUpdate({ _id: tenant }, { $set: { subscription: newSubscriptionInfo._id, regions: propertyInfo.parentId.region } });
        if(newTenantInfo.subscription){
            const previousSubscriptionInfo = await Subscription.findByIdAndUpdate({_id : newTenantInfo.subscription},{$set : {isActive: false}});
            await SubProperty.findOneAndUpdate({_id : previousSubscriptionInfo.property},{$set : {subscription : null}});
            await SubProperty.findOneAndUpdate({ _id: property }, { $set: { currentSubscription: newSubscriptionInfo._id }, $push: { subscription: newSubscriptionInfo._id }, isOccupied: true });
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "success"
            })
        }else{
            await SubProperty.findOneAndUpdate({ _id: property }, { $set: { currentSubscription: newSubscriptionInfo._id }, $push: { subscription: newSubscriptionInfo._id }, isOccupied: true });
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "success"
            })
        }
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            message: "Subscription Error",
            err: error.message
        })
    }
}


exports.removeSubscription = async(req,res) => {
    try{
        const { propertyId } = req.params;
        const propertyInfo = await SubProperty.findOneAndUpdate({_id : propertyId},{$set : {currentSubscription : null,isOccupied:false}});
        const subscriptionInfo = await Subscription.findByIdAndUpdate({_id : propertyInfo.currentSubscription},{$set : {isActive: false}});
        await User.findOneAndUpdate({ _id: subscriptionInfo?.tenant }, { $set: { subscription: null, regions: [] } });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
        })
    }catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
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

exports.getSubscriptionByTenantId = async (req, res) =>{
    let { id } = req.params
    try {
        let subscription = await Subscription.findOne({tenant:id,isActive:true}) 
        return res.status(StatusCodes.OK).json({
            error: false,
            subscription:subscription,
            message: "Subscription fetched",
        })
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            message: "Subscription Error",
            err: error.message
        })
    }
}

