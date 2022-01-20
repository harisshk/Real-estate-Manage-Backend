const { StatusCodes } = require('http-status-codes');
const { sendMail } = require('../methods/nodemailer');
const Order = require('../models/order');
const Transaction = require('../models/transaction')
const User = require('../models/user')
const SubProperty = require('../models/subProperty')
var Subscription = require('../models/subscription');
const mongoose = require('mongoose');
const { addActivitiesUser } = require("../utils/logHandler/index");
const Support = require('../models/support');
const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
exports.generateOrders = async (req, res) => {
    try {
        let subscription = await Subscription.find({ isActive: true })
            .populate({
                path: "property",
                populate: "parentId"
            })
            .populate('tenant', { name: 1, email: 1, regions: 1 });
        for (let i = 0; i < subscription.length; i++) {
            // Creating order
            let property = subscription[i].property;
            let tenant = subscription[i].tenant;
            if (property) {
                await new Order({ owner: property.owner, subscription: subscription[i]._id, region: property.parentId.region, user: tenant._id, amount: property ? property?.rent : 5500, orderMessage: `${property?.parentId?.name} - ${property?.name} | Rent ${month[new Date().getMonth()]}` }).save();
                // // Incrementing billing Cycle
                await Subscription.findOneAndUpdate({ _id: subscription[i]._id }, { $inc: { billingCycle: 1 } });
                // Sending mail 
                // let to = subscription[i].tenant.email;
                // let mailSubject = `REMAINDER!!! Propy(Invoice Remainder)`;
                // let mailBody = `Hi ${subscription[i].tenant.name} , your payment of Rs. ${subscription[i].property?.rent} is pending pay before 7th of this month to avoid due`;
                // sendMail(to, mailSubject, mailBody)
            } else {
                console.log(subscription[i]);
            }
        }
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Orders created for all active subscription ."
        })
    } catch (error) {
        // If Error Send email to Admin
        let to = `info@abmsapp.com`
        let mailSubject = `Error in creating the Order Invoice`
        let mailBody = `Hello Admin , Sorry due to some issue order invoice could not be created. Issue : ${error.message}`
        sendMail(to, mailSubject, mailBody)
    }
}

exports.placeOrder = async (req, res) => {
    try {
        const {
            tenant,
            property,
            transactionId,
            amountPaid,
            paymentStatus,
            billingCycle,
            orders,
            region,
            owner
        } = req.body;
        let transactionInput = {
            tenant: tenant,
            property: property,
            transactionId: transactionId,
            amountPaid: amountPaid,
        }
        let transactionResponse = await Transaction(transactionInput).save();
        let subscriptionInput = {
            billingCycle: paymentStatus === "Done" ? 0 : billingCycle,
            paidUntil: new Date()
        };

        await Subscription.findOneAndUpdate({ tenant: tenant, property: property }, { $set: subscriptionInput }, { new: true });
        let orderInput = {
            transactionId: transactionResponse._id,
            paymentStatus: "Done",
            owner: owner,
            region: region
        };
        for (let i = 0; i < orders.length; i++) {
            await Order.findOneAndUpdate({ _id: orders[i]._id }, { $set: orderInput });
        }
        const propertyResponse = await SubProperty.findById({ _id: property }).populate("parentId").populate("owner")
        const userId = owner
        const adminId = tenant
        const regions = propertyResponse?.parentId?.region
        const message = `Payment is done for the building ${propertyResponse?.parentId?.name} - ${propertyResponse?.name} by ${req?.user?.name} `;
        addActivitiesUser(
            userId,
            adminId,
            regions,
            message
        )
        const yourDate = new Date()
        const date = yourDate.toISOString().split('T')[0]
        let subject = `PROPY Your Payment Receipt`;
        let body = `
        <table style="width: 100%; border-collapse: collapse; height: 50px; background-color: #673ab5; color: #ffffff;" border="0">
<tbody>
<tr style="height: 50px;">
<td style="width: 36.9318%; height: 50px;">
<h1 style="text-align: center;">&nbsp; Propy</h1>
</td>
<td style="width: 63.0682%; height: 50px; text-align: right;">
<h4>Transaction confirmation.&nbsp;&nbsp;</h4>
</td>
</tr>
</tbody>
</table>
<table style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #; width: 100%;" cellspacing="0" cellpadding="0">
<tbody>
<tr style="vertical-align: top;">
<td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->
<div class="u-row-container" style="padding: 0px; background-color: transparent;">
<div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;">
<div style="border-collapse: collapse; display: table; width: 100%; background-color: #673ab5;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="333" style="width: 333px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-66p67" style="max-width: 320px; min-width: 333px; display: table-cell; vertical-align: top;">
<div style="width: 100% !important; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px;"><!-- [if (!mso)&(!IE)]><!-->
<div style="padding: 0px; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px; border: 0px solid transparent;"><!--<![endif]--><!-- [if (!mso)&(!IE)]><!--></div>
<!--<![endif]--></div>
</div>
<!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="167" style="width: 167px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px; min-width: 167px; display: table-cell; vertical-align: top;">
<div style="width: 100% !important; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px;"><!-- [if (!mso)&(!IE)]><!-->
<div style="padding: 0px; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px; border: 0px solid transparent;"><!--<![endif]--><!-- [if (!mso)&(!IE)]><!--></div>
<!--<![endif]--></div>
</div>
<!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
</div>
</div>
<div class="u-row-container" style="padding: 0px; background-color: transparent;">
<div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;">
<div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px; min-width: 500px; display: table-cell; vertical-align: top;">
<div style="width: 100% !important; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px;"><!-- [if (!mso)&(!IE)]><!-->
<div style="padding: 0px; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px; border: 0px solid transparent;"><!--<![endif]-->
<table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="overflow-wrap: break-word; word-break: break-word; padding: 0px 10px 3px; font-family: arial,helvetica,sans-serif;" align="left">
<div>
<h2>Hello, ${req?.user?.name}</h2>
<p>Thank you for paying the rent.</p>
</div>
</td>
</tr>
</tbody>
</table>
<!-- [if (!mso)&(!IE)]><!--></div>
<!--<![endif]--></div>
</div>
<!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]></tr></table></td></tr></table><![endif]--></div>
</div>
</div>
<div class="u-row-container" style="padding: 0px; background-color: transparent;">
<div class="u-row" style="margin: 0 auto; min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;">
<div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent;"><!-- [if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="250" style="width: 250px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-50" style="max-width: 320px; min-width: 250px; display: table-cell; vertical-align: top;">
<div style="width: 100% !important; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px;"><!-- [if (!mso)&(!IE)]><!-->
<div style="padding: 0px; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px; border: 0px solid transparent;"><!--<![endif]-->
<table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
<div style="line-height: 140%; text-align: left; word-wrap: break-word;">
<p style="font-size: 14px; line-height: 140%;">Paid on ${date}</p>
</div>
</td>
</tr>
</tbody>
</table>
<!-- [if (!mso)&(!IE)]><!--></div>
<!--<![endif]--></div>
</div>
<!-- [if (mso)|(IE)]></td><![endif]--> <!-- [if (mso)|(IE)]><td align="center" width="250" style="width: 250px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-50" style="max-width: 320px; min-width: 250px; display: table-cell; vertical-align: top;">
<div style="width: 100% !important; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px;"><!-- [if (!mso)&(!IE)]><!-->
<div style="padding: 0px; border-radius: 0px; -webkit-border-radius: 0px; -moz-border-radius: 0px; border: 0px solid transparent;"><!--<![endif]-->
<table style="font-family: arial,helvetica,sans-serif;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="overflow-wrap: break-word; word-break: break-word; padding: 10px; font-family: arial,helvetica,sans-serif;" align="left">
<div style="line-height: 140%; text-align: left; word-wrap: break-word;">
<p style="font-size: 14px; line-height: 140%;"> ${propertyResponse?.parentId?.name} - ${propertyResponse?.name} </p>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>
</div>
</td>
</tr>
</tbody>
</table>
<!-- [if IE]></div><![endif]-->
<table border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td align="center">&nbsp;</td>
</tr>
<tr>
<td style="text-align: center;" align="center" bgcolor="">
<table style="max-width: 600px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;" align="left" bgcolor="#ffffff">
<p style="margin: 0px; text-align: center;">Here is a summary of your recent payment.&nbsp;</p>
</td>
</tr>
<tr>
<td style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; text-align: center;" align="left" bgcolor="#ffffff">
<table style="height: 72px; width: 103.18%;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr style="height: 24px;">
<td style="padding: 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; height: 24px; text-align: left;" align="left" width="75%"><strong>Bills&nbsp;</strong></td>
<td style="padding: 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; height: 24px;" align="left" bgcolor="" width="25%">&nbsp;</td>
</tr>
<tr style="height: 24px;">
<td style="padding: 6px 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; height: 24px;" align="left" width="75%">Amount Paid</td>
<td style="padding: 6px 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; height: 24px;" align="left" width="25%">
<div>
<div>${amountPaid}</div>
</div>
</td>
</tr>
<tr style="height: 24px;">
<td style="padding: 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-top: 2px dashed #d2c7ba; border-bottom: 2px dashed #d2c7ba; height: 24px;" align="left" width="75%"><strong>Total</strong></td>
<td style="padding: 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-top: 2px dashed #d2c7ba; border-bottom: 2px dashed #d2c7ba; height: 24px;" align="left" width="25%"><strong>${amountPaid}</strong></td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
<tbody>
<tr>
<td style="font-size: 0; border-bottom: 3px solid #d4dadf;" align="center" valign="top">&nbsp;</td>
</tr>
</tbody>
<tbody>
<tr>
<td style="padding: 24px; color: white;" align="center" bgcolor="#673AB5">All Rights Reserved.</td>
</tr>
</tbody>
</table>
        `;
        sendMail(req.user.email, subject, body);
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Success"
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in placing order"
        })
    }

}

exports.historyOfOrdersTenant = async (req, res) => {
    try {
        let orderHistory = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
            .populate('subscription')
            .populate('owner', "name")
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name owner rent",
                    populate: "parentId"
                }
            })
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            orderHistory: orderHistory
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in fetching the history of orders"
        })
    }
}

exports.historyOfOrdersOwner = async (req, res) => {
    try {
        let orderHistory = await Order.find({ owner: req.user._id, paymentStatus: "Done" })
            .populate('subscription')
            .populate("user", "name")
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name rent",
                    populate: "parentId"
                }
            })
            .sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            orderHistory: orderHistory
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in fetching the history of orders"
        })
    }
}

exports.pendingDueOwner = async (req, res) => {
    try {
        let pendingDue = await Order.find({ owner: req.user._id, paymentStatus: "Pending" })
            .populate('subscription')
            .populate({
                path: "subscription",
                populate: {
                    path: "tenant",
                    select: "name"
                }
            })
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name rent"
                }
            })
            .sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            orderHistory: pendingDue
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in fetching the dues"
        })
    }
}

exports.historyOfOrdersRegionalAdmin = async (req, res) => {
    try {
        let orderHistory = await Order.find({ region: req.user.regions[0], paymentStatus: "Done" })
            .populate('subscription')
            .populate("user", "name")
            .populate("owner", "name")
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name rent",
                    populate: "parentId"
                }
            })
            .sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            orderHistory: orderHistory
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in fetching the history of orders"
        })
    }
}

exports.pendingDueRegionalAdmin = async (req, res) => {
    try {
        let pendingDue = await Order.find({ region: req.user.regions[0], paymentStatus: "Pending" })
            .populate('subscription')
            .populate("transactionId")
            .populate({
                path: "subscription",
                populate: {
                    path: "tenant",
                    select: "name"
                }
            })
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name owner rent"
                }
            })
            .sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            orderHistory: pendingDue
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in fetching the dues"
        })
    }
}

exports.historyOfOrdersAdmin = async (req, res) => {
    try {
        let orderHistory = await Order.find({ paymentStatus: "Done" })
            .populate('subscription')
            .populate("user", "name")
            .populate("owner", "name")
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name rent",
                    populate: "parentId"
                }
            })
            .sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            orderHistory: orderHistory
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in fetching the history of orders"
        })
    }
}

exports.pendingDueAdmin = async (req, res) => {
    try {
        let pendingDue = await Order.find({ paymentStatus: "Pending" })
            .populate('subscription')
            .populate({
                path: "subscription",
                populate: {
                    path: "tenant",
                    select: "name"
                }
            })
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name owner rent"
                }
            })
            .sort({ createdAt: -1 });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            orderHistory: pendingDue
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in fetching the dues"
        })
    }
}

exports.sendRemainder = async (req, res) => {
    try {
        const { to, subject, body } = req.body;
        let user = await User.findOne({ _id: to });

        sendMail(user.email, subject, body);
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Remainder Sent"
        })
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error,
            message: "Error in sending the remainder"
        })
    }
}

exports.getTotalAmountByProperty = async (req, res) => {
    const { id } = req.params
    try {
        const totalCount = await Transaction.aggregate([
            { $match: { property: new mongoose.Types.ObjectId(id) } },
            { $group: { _id: "$property", total: { $sum: "$amountPaid" } } }
        ])
        if (totalCount.length !== 0) {
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "Property total rent fetched successfully",
                totalCount: totalCount[0].total
            })
        } else {
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "Property total rent fetched successfully",
                totalCount: 0
            })
        }
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            message: error.message
        })
    }
}

exports.findMonth = async (req, res) => {

 
   
}