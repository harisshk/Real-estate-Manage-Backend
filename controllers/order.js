const { StatusCodes } = require('http-status-codes');
const { sendMail } = require('../methods/nodemailer');
const Order = require('../models/order');
const Transaction = require('../models/transaction')
var Subscription = require('../models/subscription')

exports.generateOrders = async(req,res) => {
    try {
        let subscription = await Subscription.find({ isActive: true }).populate('property', { rent: 1 }).populate('tenant', { name: 1, email: 1 });
        console.log(subscription , ' ----- ' , subscription.length)
        for (let i = 0; i < subscription.length; i++) {
            // Creating order
            await new Order({ subscription: subscription[i]._id, user: subscription[i].tenant._id, amount: subscription[i].property?.rent }).save();
            // Incrementing billing Cycle
            await Subscription.findOneAndUpdate({_id : subscription[i]._id},{$inc: {billingCycle: 1}});
            // Sending mail 
            let to = subscription[i].tenant.email;
            let mailSubject = `REMAINDER!!! Propy(Invoice Remainder)`;
            let mailBody = `Hi ${subscription[i].tenant.name} , your payment of Rs. ${subscription[i].property?.rent} is pending pay before 7th of this month to avoid due`;
            sendMail(to, mailSubject, mailBody)
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
        console.log(req.body,'---------');
        const{tenant , property , transactionId , amountPaid , paymentStatus} = req.body;
        let transactionInput = {
            tenant : tenant,
            property : property,
            transactionId : transactionId,
            amountPaid : amountPaid
        }
        let transactionResponse = await Transaction(transactionInput);
        let subscriptionInput = {
            billingCycle : 0,
            paidUntil : new Date()
        };
        let subscriptionResponse = await Subscription.findOneAndUpdate({tenant : tenant , property : property},{$set : subscriptionInput},{new : true})
        let orderInput = {
            transactionId : transactionResponse._id,
            paymentStatus : paymentStatus
        };
        await Order.findOneAndUpdate({_id :subscriptionResponse._id},{$set : orderInput});
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