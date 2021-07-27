
const Profile = require("../models/profile");
const { StatusCodes } = require("http-status-codes");

exports.createProfile = async (req, res) => {
    try {
        let profile = await new Profile(req.body).save();
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            profile: profile
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in creating profile"
        })
    }

}

exports.getProfileInfo = async (req, res) => {
    try {
        let { userId } = req.params;
        let profile = await Profile.findOne({ user: userId });
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            profile: profile,
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in getting profile",
        })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        let profile = await Profile.findOneAndUpdate({ user: req.body.userId }, { $set: req.body }, { new: true });
        if (profile === null) {
            await new Profile(req.body).save();
        }
        return res.status(StatusCodes.OK).json({
            error: false,
            message: "success",
            profile:profile
        })
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            err: error.message,
            message: "Error in updating profile"
        })
    }
}
exports.getUnverifiedProfileAdminCount = async (req, res) => {
    Profile.find({ isVerified: false ,isActive:true}).countDocuments()
        .then((count) => {
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "success",
                count: count,
            })
        })
        .catch((error) => {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: true,
                err: error.message,
                message: "Error in updating profile"
            })
        })
}
exports.getUnverifiedProfileRegionalAdminCount = async (req, res) => {
    // req.user.regions[0]
    Profile.find({ isVerified: false,isActive:true, region : req.user.regions[0]}).countDocuments()
        .then((count) => {
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "success",
                count: count,
            })
        })
        .catch((error) => {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: true,
                err: error.message,
                message: "Error in updating profile"
            })
        })
}
exports.getUnverifiedProfileAdmin = async (req, res) => {
    Profile.find({ isVerified: false,isActive:true })
    .populate("user")
    .populate("rejectedBy")
        .then((profile) => {
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "success",
                profile: profile,
            })
        })
        .catch((error) => {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: true,
                err: error.message,
                message: "Error in updating profile"
            })
        })
}
exports.getUnverifiedProfileRegionalAdmin = async (req, res) => {
    Profile.find({ isVerified: false,isActive:true,region:req.user.regions[0]})
    .populate("user")
    .populate("rejectedBy")
        .then((profile) => {
            return res.status(StatusCodes.OK).json({
                error: false,
                message: "success",
                profile: profile,
            })
        })
        .catch((error) => {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: true,
                err: error.message,
                message: "Error in updating profile"
            })
        })
}
