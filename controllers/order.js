const { StatusCodes } = require('http-status-codes');
var schedule = require('node-schedule');
const Order = require('../models/order');
var Subscription = require('../models/subscription')

schedule.scheduleJob('1,2,4,5 * * * *', async()=>{
    try{
        let subscription = await Subscription.find({isActive : true}) ;
        for(let i = 0 ; i < subscription.length ; i++){
         await new Order({subscription : subscription[i]._id ,  user : subscription[i].tenant }).save() 
       }
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message , 
            message : "Error in creating the Orders"
        })
    }
    
});

exports.generateOrders = async(req,res) => {
    try{
        let subscription = await Subscription.find({isActive : true}).populate('property') ;
        for(let i = 0 ; i < subscription.length ; i++){
     await new Order({subscription : subscription[i]._id ,  user : subscription[i].tenant , amount: subscription[i].property.rent }).save() 
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