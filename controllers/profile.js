
const Profile = require("../models/profile");
const {StatusCodes} = require("http-status-codes");

exports.createProfile = async(req,res) => {
    try{
        await new Profile(req.body).save();
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success",
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : false ,
            err : error.message ,
            message : "Error in creating profile"
        })
    }
    
}

exports.getProfileInfo = async(req,res)=>{
    try{
        let {userId} = req.params ;
        let profile = await Profile.findOne({user : userId});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message :"success",
            profile : profile,
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err : error.message ,
            message : "Error in getting profile",
        })
    }
}

exports.updateProfile = async (req,res)=>{
    try{
        await Profile.findOneAndUpdate({_id : profileId},{$set : req.body});
        return res.status(StatusCodes.OK).json({
            error : false ,
            message : "success"
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true ,
            err : error.message,
            message :"Error in updating profile"
        })
    }
}