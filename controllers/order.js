const { StatusCodes } = require('http-status-codes');
const { sendMail } = require('../methods/nodemailer');
const Order = require('../models/order');
const Transaction = require('../models/transaction')
const User = require('../models/user')
var Subscription = require('../models/subscription');

const month = ["Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Aug" , "Sep" , "Oct", "Nov" , "Dec"]

exports.generateOrders = async(req,res) => {
    try {
        let subscription = await Subscription.find({ isActive: true }).populate('property', { rent: 1 , name : 1 , owner : 1 , region : 1 }).populate('tenant', { name: 1, email: 1  , regions : 1});
    
        for (let i = 0; i < subscription.length; i++) {
           // Creating order
            let property = subscription[i].property;
            let tenant = subscription[i].tenant;
            if(property ){
                await new Order({ owner : property.owner, subscription: subscription[i]._id, region : property.region , user: tenant._id, amount: property ? property?.rent : 5500 , orderMessage : `${property?.name} | Rent ${month[new Date().getMonth()]}` }).save();
                // // Incrementing billing Cycle
                await Subscription.findOneAndUpdate({_id : subscription[i]._id},{$inc: {billingCycle: 1}});
                // Sending mail 
                let to = subscription[i].tenant.email;
                let mailSubject = `REMAINDER!!! Propy(Invoice Remainder)`;
                let mailBody = `Hi ${subscription[i].tenant.name} , your payment of Rs. ${subscription[i].property?.rent} is pending pay before 7th of this month to avoid due`;
                sendMail(to, mailSubject, mailBody)
            }else {
                console.log(subscription[i]);
            }
        }
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "Orders created for all active subscription ."
        })
    } catch (error) {
        console.log(error);
        // If Error Send email to Admin
        let to = `hari.jsmith494@gmail.com`
        let mailSubject =  `Error in creating the Order Invoice`
        let mailBody =  `Hello Admin , Sorry due to some issue order invoice could not be created. Issue : ${error.message}`
        sendMail(to,mailSubject,mailBody)
    }
}

exports.placeOrder = async(req,res) => {
    try{
        const{tenant , property , transactionId , amountPaid , paymentStatus , billingCycle , orders , region , owner} = req.body;
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
        let orderHistory = await Order.find({user : req.user._id}).sort({createdAt : -1});
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
        let orderHistory = await Order.find({owner: req.user._id , paymentStatus : "Done"})
            .populate({
                path : "subscription",
                 populate :'tenant'
            })
            .populate({
                path : "subscription",
                populate :'property'
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
            .populate({
                path : "subscription", 
                populate :'tenant'
            })
            .populate({
                path : "subscription",
                populate :'property'
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
        let orderHistory = await Order.find({region : req.user.regions[0],paymentStatus : "Done"})
            .populate('subscription')
            .populate({
                path : "subscription",
                populate :'tenant'
            })
            .populate({
                path : "subscription",
                populate :'property'
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
            .populate({
                path : "subscription",
                populate :'tenant'
            })
            .populate({
                path : "subscription",
                populate :'property'
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
            .populate({
                path : "subscription",
                populate : {
                    path : "tenant",
                    select : "name"
                }})
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
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : "Error in sending the remainder",
            message : "Error in sending the remainder"
        })
    }
}