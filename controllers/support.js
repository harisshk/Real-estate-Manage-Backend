const { StatusCodes } = require("http-status-codes");
const { sendMail } = require("../methods/nodemailer");
const Support = require("../models/support");
const user = require("../models/user");
const { addActivitiesUser } = require('../utils/logHandler/index')
exports.createSupport = async (req, res) => {
    Support.find({})
        .countDocuments()
        .then((count) => {
            let newSupportCount = {
                ...req.body,
                messages: [{ date: Date(), message: "Ticket created" }],
                supportNo: String(count + 1000 + 1)
            }
            let newSupport = new Support(newSupportCount)
            newSupport.save()
                .then((support) => {
                    return res.status(StatusCodes.OK).json({
                        error: false,
                        message: "success",
                        support: support
                    })
                })
                .catch((error) => {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        error: true,
                        err: error.message,
                        message: "Error in creating the support",
                    })
                })
        })
        .catch((error) => {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: true,
                err: error.message,
                message: "Error in creating the support",
            })
        })
}



exports.updateStatusSupport = async (req, res) => {
    try {
        let support = await Support.findOneAndUpdate(
                { _id: req.params.supportId }, 
                { $set: req.body }, 
                { new: true }
            ).populate("user");
        let body = `#${support.supportNo} Support Number Status has changed to ${req.body.status}`;
        let subject = `(#${support.supportNo} Support Number) Status has been updated`;
        sendMail(support?.user?.email, subject, body)
        const userId = support?.user?._id
        const region = support?.user?.regions[0]
        const adminId = req?.user?._id
        const message = `Support with support number ${support?.supportNo} is closed by ${req?.user?.name} `
        addActivitiesUser(
            userId,
            adminId,
            region,
            message
        )
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            support: support,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating the support",
        })
    }
}
exports.addMessageSupport = async (req, res) => {
    try {
        var arr = []
        arr.push({ date: Date(), message: req.body.message,user:req.user.id });
        let support = await Support.findOneAndUpdate(
                { _id: req.params.supportId }, 
                { $push:{messages:arr}  }, 
                { new: true }
            )
            .populate("user");
        let body = `${req.body.message}`;
        let subject = `(#${support.supportNo} Support Number) Admins Have Responded to your Request`;
        sendMail(support?.user?.email,subject,body)
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            support: support,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating the support message",
        })
    }
}

exports.getSupportList = async (req, res) => {
    try {
        let supports = await Support.find({ user: req.params.userId }).populate({
            path:"property",
            populate:"parentId"
        });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            supports: supports,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating the support",
        })
    }
}

exports.supportDescription = async (req, res) => {
    try {
        let support = await Support.findOne({ _id: req.params.supportId })
            .populate("user", { password: 0, jwtToken: 0, fcmToken: 0 })
            .populate({
                path: "property",
                populate: "owner parentId",
                select: { "password": 0, "jwtToken": 0, "fcmToken": 0 },
            })
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            support: support,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: false,
            err: error.message,
            message: "Error in updating the support",
        })
    }
}
exports.getAllSupportByAdmin = async (req, res) => {
    try {
        let supports = await Support.find({}).populate('user')
        .populate({
            path:"property",
            populate:"owner parentId"
        });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            supports: supports,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating the support",
        })
    }
}
exports.getSupportByFilterAdmin = async (req, res) => {
    const {status} = req.body
    try {
        let supports = await Support.find({status:status}).populate('user');
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            supports: supports,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating the support",
        })
    }
}

exports.getAllSupportByRegionalAdmin = async (req, res) => {
    try {
        let supports = await Support.find({ region: req.user.regions[0] }).populate('user')
        .populate({
            path:"property",
            populate:"owner parentId"
        });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            supports: supports,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating the support",
        })
    }
}
exports.getSupportByFilterRegionalAdmin = async (req, res) => {
    const {status} = req.body
    try {
        let supports = await Support.find({ status:status,region: req.user.regions[0] }).populate('user');
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            supports: supports,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating the support",
        })
    }
}

exports.filterByDateRegionalAdmin = async(req,res) => {
    const { startDate, endDate} = req.body
    try{
        let supports = await Support.find({createdAt:{$gte:startDate,$lte:endDate,region: req.user.regions[0]}}).populate('user')
        return res.status(StatusCodes.OK).json({
            error : false,
            message :"success",
            supports : supports,
        })
    }catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err: error.message,
            message :"Error in fetching the Supports",
        })
    }
}
exports.filterByDateAdmin = async(req,res) => {
    const { startDate, endDate} = req.body
    try{
        let supports = await Support.find({createdAt:{$gte:startDate,$lte:endDate}}).populate('user')
        return res.status(StatusCodes.OK).json({
            error : false,
            message :"success",
            supports : supports,
        })
    }catch(error){
        return res.status(StatusCodes.BAD_REQUEST).json({
            error : true,
            err: error.message,
            message :"Error in fetching the Supports",
        })
    }
}