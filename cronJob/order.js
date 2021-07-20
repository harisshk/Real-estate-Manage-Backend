const { StatusCodes } = require('http-status-codes');
var cron = require('node-cron');
const { sendMail } = require('../methods/nodemailer');
const Order = require('../models/order');
const subscription = require('../models/subscription');
var Subscription = require('../models/subscription')



const scheduledJobForCreatingOrderEveryMonth = () => {
    try {
        let subscription = await Subscription.find({ isActive: true }).populate('property', { rent: 1 }).populate('tenant', { name: 1, email: 1 });
        for (let i = 0; i < subscription.length; i++) {
            await new Order({ subscription: subscription[i]._id, user: subscription[i].tenant._id, amount: subscription[i].property?.rent }).save()
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
        let to = `hari.jsmith494@gmail.com`
        let mailSubject =  `Error in creating the Order Invoice`
        let mailBody =  `Hello Admin , Sorry due to some issue order invoice could not be created. Issue : ${error.message}`
        sendMail(to,mailSubject,mailBody)
    }
}


cron.schedule('0 0 1 * *', scheduledJobForCreatingOrderEveryMonth);