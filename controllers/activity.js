const { StatusCodes }  =require('http-status-codes');
const Activities = require('../models/activities')
exports.getUserActivities = async(req,res) => {
    try{
        let activities = await Activities.find({}).populate('user').populate('updatedBy').sort({createdAt : -1});
        return res.status(StatusCodes.OK).json({
            error : false,
            message :"success",
            activities : activities,
        })
    }catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err: error.message,
            message :"Error in fetching the User Activities",
            activities : activities,
        })
    }
}

exports.filterByDate = async(req,res) => {
    const { startDate, endDate} = req.body
    try{
        let activities = await Activities.find({createdAt:{$gt:startDate,$lt:endDate}}).populate('user').populate('updatedBy');
        return res.status(StatusCodes.OK).json({
            error : false,
            message :"success",
            activities : activities,
        })
    }catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err: error.message,
            message :"Error in fetching the User Activities",
        })
    }
}