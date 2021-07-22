const { StatusCodes } = require('http-status-codes');
var cron = require('node-cron');
const { sendMail } = require('../methods/nodemailer');
const Order = require('../models/order');
const Subscription = require('../models/subscription')



const scheduledJobForCreatingOrderEveryMonth =async () => {
    try {
        let subscription = await Subscription.find({ isActive: true }).populate('property', { rent: 1 }).populate('tenant', { name: 1, email: 1 });
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
        console.log('------------------------------CRON JOB TASK COMPLETED----------------------------------')
    } catch (error) {
        console.log(error);
        // If Error Send email to Admin
        let to = `hari.jsmith494@gmail.com`
        let mailSubject =  `Error in creating the Order Invoice`
        let mailBody =  `Hello Admin , Sorry due to some issue order invoice could not be created. Issue : ${error.message}`
        sendMail(to,mailSubject,mailBody)
    }
}


cron.schedule('0 0 1 * *', scheduledJobForCreatingOrderEveryMonth);