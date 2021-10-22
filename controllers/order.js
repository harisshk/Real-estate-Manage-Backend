const { StatusCodes } = require('http-status-codes');
const { sendMail } = require('../methods/nodemailer');
const Order = require('../models/order');
const Transaction = require('../models/transaction')
const User = require('../models/user')
var Subscription = require('../models/subscription');
const  mongoose = require('mongoose');
//const {addTransactionUser} = require("../utils/logHandler/index")
const month = ["Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Aug" , "Sep" , "Oct", "Nov" , "Dec"]
exports.generateOrders = async(req,res) => {
    try {
        let subscription = await Subscription.find({ isActive: true })
        .populate({
            path:"property",
            populate:"parentId"
        })
        .populate('tenant', { name: 1, email: 1  , regions : 1});
        for (let i = 0; i < subscription.length; i++) {
           // Creating order
            let property = subscription[i].property;
            let tenant = subscription[i].tenant;
            if(property ){
                await new Order({ owner : property.owner, subscription: subscription[i]._id, region : property.parentId.region , user: tenant._id, amount: property ? property?.rent : 5500 , orderMessage : `${property?.name} | Rent ${month[new Date().getMonth()]}` }).save();
                // // Incrementing billing Cycle
                await Subscription.findOneAndUpdate({_id : subscription[i]._id},{$inc: {billingCycle: 1}});
                // Sending mail 
                // let to = subscription[i].tenant.email;
                // let mailSubject = `REMAINDER!!! Propy(Invoice Remainder)`;
                // let mailBody = `Hi ${subscription[i].tenant.name} , your payment of Rs. ${subscription[i].property?.rent} is pending pay before 7th of this month to avoid due`;
                // sendMail(to, mailSubject, mailBody)
            }else {
                console.log(subscription[i]);
            }
        }
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Orders created for all active subscription ."
        })
    } catch (error) {
        // If Error Send email to Admin
        let to = `hari.jsmith494@gmail.com`
        let mailSubject =  `Error in creating the Order Invoice`
        let mailBody =  `Hello Admin , Sorry due to some issue order invoice could not be created. Issue : ${error.message}`
        sendMail(to,mailSubject,mailBody)
    }
}

exports.placeOrder = async(req,res) => {
    try{
        const{
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
            tenant : tenant,
            property : property,
            transactionId : transactionId,
            amountPaid : amountPaid,
        }
        let transactionResponse = await Transaction(transactionInput).save();
        let subscriptionInput = {
            billingCycle : paymentStatus === "Done" ? 0 : billingCycle ,
            paidUntil : new Date()
        };
        //addTransactionUser("",`Rent payed ${amountPaid} in the region ${region}`,tenant)
        await Subscription.findOneAndUpdate({tenant : tenant , property : property},{$set : subscriptionInput},{new : true});
        let orderInput = {
            transactionId : transactionResponse._id,
            paymentStatus : "Done",
            owner : owner,
            region : region
        };
        for(let i = 0 ; i < orders.length ; i++){
            await Order.findOneAndUpdate({_id :orders[i]._id},{$set : orderInput});  
        }
        let subject = `PROPY Your Payment Receipt`;
        let body = `<table border="0" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td align="center" bgcolor="#D2C7BA">
        <table style="max-width: 600px;" border="0" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;" align="left" bgcolor="#ffffff">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -1px; line-height: 48px;">PROPY! Payment Receipt&nbsp;</h1>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        <tr>
        <td align="center" bgcolor="#D2C7BA">
        <table style="max-width: 600px;" border="0" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;" align="left" bgcolor="#ffffff">
        <p style="margin: 0;">Here is a summary of your recent payment. If you have any questions or concerns about your order, please <a href="https://propy-d6d47.web.app/">contact us</a>.</p>
        </td>
        </tr>
        <tr>
        <td style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;" align="left" bgcolor="#ffffff">
        <table style="height: 96px; width: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
        <tr style="height: 24px;">
        <td style="padding: 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; height: 24px;" align="left" bgcolor="#D2C7BA" width="75%"><strong>Bills TransactionId # ${transactionId}</strong></td>
        <td style="padding: 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; height: 24px;" align="left" bgcolor="#D2C7BA" width="25%">&nbsp;</td>
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
        <tr>
        <td align="center" valign="top" bgcolor="#D2C7BA" width="100%">
        <table style="max-width: 600px;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center" bgcolor="#ffffff">
        <tbody>
        <tr>
        <td style="font-size: 0; border-bottom: 3px solid #d4dadf;" align="center" valign="top">&nbsp;</td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        <tr>
        <td style="padding: 24px;" align="center" bgcolor="#D2C7BA">
        <table style="max-width: 600px;" border="0" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;" align="center" bgcolor="#D2C7BA">
        <p style="margin: 0;">You received this email because you have subscribed to propy.</p>
        </td>
        </tr>
        <tr>
        <td style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;" align="center" bgcolor="#D2C7BA">&nbsp;</td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        <!-- end body -->`;
        sendMail(req.user.email,subject,body);
        return res.status(StatusCodes.OK).json({
            error : false,
            message : "Success"
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true ,
            err : error.message,
            message :"Error in placing order"
        })
    }
    
}

exports.historyOfOrdersTenant = async(req,res) => {
    try{
        let orderHistory = await Order.find({user : req.user._id}).sort({createdAt : -1})
            .populate('subscription')
            .populate('owner',"name")
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name owner rent",
                    populate:"parentId"
                }
            })
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success" ,
            orderHistory : orderHistory
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message,
            message : "Error in fetching the history of orders"
        })
    }
}

exports.historyOfOrdersOwner = async(req,res) => {
    try{
        let orderHistory = await Order.find({ owner: req.user._id, paymentStatus: "Done" })
            .populate('subscription')
            .populate("user", "name")
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name rent",
                    populate:"parentId"
                }
            })
            .sort({createdAt : -1});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success" ,
            orderHistory : orderHistory
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message,
            message : "Error in fetching the history of orders"
        })
    }
}

exports.pendingDueOwner = async(req,res) => {
    try{
        let pendingDue = await Order.find({owner: req.user._id, paymentStatus : "Pending"})
        .populate('subscription')
            .populate({
                path : "subscription", 
                populate : {
                    path : "tenant",
                    select : "name"
                }
            })
            .populate({
                path : "subscription", 
                populate : {
                    path : "property",
                    select : "name rent"
                }
            })
            .sort({createdAt : -1});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success" ,
            orderHistory : pendingDue
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message,
            message : "Error in fetching the dues"
        })
    }
}

exports.historyOfOrdersRegionalAdmin = async(req,res) => {
    try{
        let orderHistory = await Order.find({ region: req.user.regions[0], paymentStatus: "Done" })
            .populate('subscription')
            .populate("user", "name")
            .populate("owner", "name")
            .populate({
                path: "subscription",
                populate: {
                    path: "property",
                    select: "name rent",
                    populate:"parentId"
                }
            })
            .sort({createdAt : -1});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success" ,
            orderHistory : orderHistory
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message,
            message : "Error in fetching the history of orders"
        })
    }
}

exports.pendingDueRegionalAdmin = async(req,res) => {
    try{
        let pendingDue = await Order.find({region : req.user.regions[0],paymentStatus : "Pending"})
        .populate('subscription')
        .populate("transactionId")
        .populate({
            path : "subscription", 
            populate : {
                path : "tenant",
                select : "name"
            }
        })
        .populate({
            path : "subscription", 
            populate : {
                path : "property",
                select : "name owner rent"
            }
        })
            .sort({createdAt : -1});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success" ,
            orderHistory : pendingDue
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message,
            message : "Error in fetching the dues"
        })
    }
}

exports.historyOfOrdersAdmin = async(req,res) => {
    try{
        let orderHistory = await Order.find({paymentStatus : "Done"})
            .populate('subscription')
            .populate("user", "name")
            .populate("owner", "name")
            .populate({
                path : "subscription", 
                populate : {
                    path : "property",
                    select : "name rent",
                    populate:"parentId"
                }
            })
            .sort({createdAt : -1});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success" ,
            orderHistory : orderHistory
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message,
            message : "Error in fetching the history of orders"
        })
    }
}

exports.pendingDueAdmin = async(req,res) => {
    try{
        let pendingDue = await Order.find({paymentStatus : "Pending"})
            .populate('subscription')
            .populate({
                path : "subscription", 
                populate : {
                    path : "tenant",
                    select : "name"
                }
            })
            .populate({
                path : "subscription", 
                populate : {
                    path : "property",
                    select : "name owner rent"
                }
            })
            .sort({createdAt : -1});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success" ,
            orderHistory : pendingDue
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message,
            message : "Error in fetching the dues"
        })
    }
}

exports.sendRemainder = async (req,res) => {
    try{
        const {to , subject , body} = req.body;
        let user =await User.findOne({_id : to});

        sendMail(user.email, subject, body);
        return res.status(StatusCodes.OK).json({
            error : false,
            message : "Remainder Sent"
        })
 }catch(error){
     console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : error,
            message : "Error in sending the remainder"
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