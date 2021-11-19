const { StatusCodes } = require('http-status-codes');
var cron = require('node-cron');
const { sendMail } = require('../methods/nodemailer');
const Order = require('../models/order');
const Subscription = require('../models/subscription')

const scheduledJobForCreatingOrderEveryMonth =async () => {
    const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",]
    try {
        let subscription = await Subscription.find({ isActive: true })
        .populate({
            path: "property",
            populate: "parentId"
        }).populate('tenant', { name: 1, email: 1 , regions : 1});
        for (let i = 0; i < subscription.length; i++) {
            // Creating order
            let property = subscription[i].property;
            let tenant = subscription[i].tenant;
            if(property ){
                await new Order({ owner : property?.owner, subscription: subscription[i]?._id, region : property?.parentId?.region , user: tenant?._id, amount: property ? property?.rent : 5500 , orderMessage : `${property?.name} | Rent ${month[new Date().getMonth()]}` }).save();
               
                // Incrementing billing Cycle
                await Subscription.findOneAndUpdate({_id : subscription[i]?._id},{$inc: {billingCycle: 1}});
               
                // Sending mail 
                let to = subscription[i].tenant.email;
                let mailSubject = `REMAINDER!!! Propy(Invoice Remainder)`;
                let mailBody = `Hi ${subscription[i].tenant.name} , your payment of Rs. ${subscription[i].property?.rent} is pending pay before 7th of this month to avoid due`;
                sendMail(to, mailSubject, mailBody)
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



cron.schedule('0 0 1 * *', scheduledJobForCreatingOrderEveryMonth);