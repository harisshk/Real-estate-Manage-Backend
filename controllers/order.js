const { StatusCodes } = require('http-status-codes');
var schedule = require('node-schedule');
const { invoiceMailer } = require('../methods/nodemailer');
const Order = require('../models/order');
var Subscription = require('../models/subscription')

schedule.scheduleJob('1,2,4,5 * * * *', async()=>{
    try{
        let subscription = await Subscription.find({isActive : true}).populate('property',{rent : 1}).populate('tenant',{name :1 , email : 1}) ;
        for(let i = 0 ; i < subscription.length ; i++){
            await new Order({subscription : subscription[i]._id ,  user : subscription[i].tenant._id , amount: subscription[i].property?.rent }).save() 
        let content = `Hi ${subscription[i].tenant.name} , your payment of Rs. ${subscription[i].property?.rent} is pending pay before 7th of this month to avoid due`  
        invoiceMailer(subscription[i].tenant.email , 'Propy(Invoice Remainder)', content)
    }
       return res.status(StatusCodes.OK).json({
           error : false ,
           message : "Orders created for all active subscription ."
       })
    }catch(error){
        console.log(error);
        
    }
});

exports.generateOrders = async(req,res) => {
    try{
        let subscription = await Subscription.find({isActive : true}).populate('property',{rent : 1}).populate('tenant',{name :1 , email : 1}) ;
        for(let i = 0 ; i < subscription.length ; i++){
            // console.log(subscription[i].property?.rent,'---' , i , '---' , subscription[i]._id)
            await new Order({subscription : subscription[i]._id ,  user : subscription[i].tenant._id , amount: subscription[i].property?.rent }).save() 
        let content = `Hi ${subscription[i].tenant.name} , your payment of Rs. ${subscription[i].property?.rent} is pending pay before 7th of this month to avoid due`  
        invoiceMailer(subscription[i].tenant.email , 'Propy(Invoice Remainder)', content)
    }
       return res.status(StatusCodes.OK).json({
           error : false ,
           message : "Orders created for all active subscription ."
       })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message , 
            message : "Error in creating the Orders"
        })
    }
}