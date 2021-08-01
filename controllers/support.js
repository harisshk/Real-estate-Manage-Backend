const { StatusCodes } = require("http-status-codes");
const Support = require("../models/support")

exports.createSupport = async(req,res) => {
    try{
        let support = await new Support(req.body).save();
        console.log(support);
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success",
            support :support,
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : error.message,
            message : "Error in creating the support",
        })
    }

}

exports.updateSupport = async (req,res) => {
    try{
        let support = await Support.findOneAndUpdate({_id : req.params.supportId},{$set : req.body},{new : true});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success",
            support :support,
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : error.message,
            message : "Error in updating the support",
        })
    }
}

exports.getSupportList = async(req,res) => {
    try{
        let supports = await Support.find({user : req.params.userId});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success",
            supports :supports,
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : error.message,
            message : "Error in updating the support",
        })
    }
}

exports.supportDescription = async(req,res) => {
    try{
        let support = await Support.findOne({_id : req.params.supportId});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success",
            support :support,
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false,
            err : error.message,
            message : "Error in updating the support",
        })
    }
}
export const getAllSupportByAdmin = async(req,res) => {
    try{
        let supports = await Support.find({});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success",
            supports :supports,
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : error.message,
            message : "Error in updating the support",
        })
    }
}

export const getAllSupportByRegionalAdmin = async(req,res) => {
    try{
        let supports = await Support.find({region : req.body.region});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success",
            supports :supports,
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : error.message,
            message : "Error in updating the support",
        })
    }
}