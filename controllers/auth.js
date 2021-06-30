const User = require("../models/user");
const OTPAuth = require("../models/auth");
const {StatusCodes, getReasonPhrase} = require("http-status-codes");
const {generateRandom4DigitOTP} = require("../methods/otpGenerate");
const {mailer} = require("../methods/nodemailer");
const jwt = require("jsonwebtoken");

exports.generateOTP = async (req, res) => {
	OTPAuth.findOne({user: req.body.user})
		.then((user) => {
			const otp = generateRandom4DigitOTP();
			let otpStoreError = false;
			if (user) {
				OTPAuth.findOneAndUpdate({user: req.body.user}, {$set: {otp: otp}})
					.then((updateResponse) => {
						otpStoreError = false;
					})
					.catch(() => {
						otpStoreError = true;
					});
			} else {
				let newOTP = new OTPAuth({
					user: req.body.user,
					otp: otp,
				});
				newOTP
					.save()
					.then((updateResponse) => {
						otpStoreError = false;
					})
					.catch(() => {
						otpStoreError = true;
					});
			}
			mailer(req.body.user, otp);
			res.status(StatusCodes.OK).send({
				success: true,
				message: "OTP successsfully sent",
			});
		})
		.catch((error) => {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
				error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
				success: false,
				message: "OTP successsfully sent",
			});
		});
};

exports.validateOTP = (req, res) => {
	OTPAuth.findOne({user: req.body.user})
		.then((userOTP) => {
			if (userOTP) {
				if (userOTP.otp === req.body.otp) {
					let token = jwt.sign({_id: userOTP._id}, "secretCode");
					OTPAuth.findOneAndRemove({user: req.body.user})
						.then(() =>
							res.status(StatusCodes.OK).send({
								success: true,
								token: token,
								message: "OTP is verified",
							}),
						)
						.catch((error) => {
							res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
								error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
								success: false,
							});
						});
				} else {
					res.status(StatusCodes.OK).send({
						success: false,
						message: "OTP is invalid",
					});
				}
			} else {
				res.status(StatusCodes.OK).send({
					success: false,
					message: "OTP is invalid",
				});
			}
		})
		.catch((error) => {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
				error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
				success: false,
			});
		});
};

exports.isAdmin = (req, res, next) => {
	if (!req.body || !req.user || req.user.role !== "admin") {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};

// @desc To set userInfo to the req.user
exports.setUser = (req, res, next, id) => {
	if (!id) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			message: "user Id Not Available",
		});
	}
	User.findOne({_id: id}, (error, userInfo) => {
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				error: true,
				message: "Error in finding the user Id",
			});
		}
		userInfo.password = undefined;
		req.user = userInfo;
		next();
	});
};

// @type middleware
// @desc To check whether the user Signed in properly
exports.isSignedIn = (req, res, next) => {
	const bearerHeader = req.headers["authorization"];

	if (bearerHeader) {
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		if (!req.user || bearerToken !== req.user.jwtToken) {
			return res.status(400).json({
				error: true,
				message: "Un authorized access",
			});
		}
		next();
	} else {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			message: "No token found",
		});
	}
};

exports.isOwner = (req, res, next) => {
	if (!req.body || !req.user || req.user.role !== "owner") {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};

exports.isRegionalAdmin = (req, res, next) => {
	if (!req.body || !req.user || req.user.role !== "regionalAdmin") {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};
