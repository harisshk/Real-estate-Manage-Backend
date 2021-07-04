const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Profile = require("../models/profile");
const {StatusCodes} = require("http-status-codes");

exports.register = async (req, res) => {
	try {
		//Checking for a user with same email Id
		let preUser = await User.findOne({email: req.body.email});
		if (preUser) {
			return res.status(StatusCodes.CONFLICT).json({
				error: true,
				message: "DUPLICATE_USER",
			});
		}
		let newUser = await new User(req.body).save();
		newUser.password = undefined;
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "Account is created Successfully",
			user: newUser,
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in creating the Account",
			error: true,
			err: error.message,
		});
	}
};

exports.verifyAccount = (req, res) => {
	try {
		User.find({email: req.body.email}, (error, result) => {
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			if (error || result.length !== 0) {
				return res.status(StatusCodes.CONFLICT).json({
					message: "ACCOUNT_EXISTS",
					error: true,
				});
			}
			let userNameMail = process.env.SENDER_EMAIL;
			let applicationPassword = process.env.SENDER_EMAIL_PASSWORD;
			var transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: userNameMail,
					pass: applicationPassword,
				},
			});
			var OTP = generateRandom4DigitOTP();
			let {email} = req.body;
			var mailOptions = {
				from: "hari.jsmith494@gmail.com",
				to: email,
				subject: `Verification Mail`,
				html: `<p>your verification OTP is ${OTP}</p>`,
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					return res.status(StatusCodes.BAD_REQUEST).json({
						error: true,
						err: error,
						message: "Mail error",
					});
				}
				return res.status(StatusCodes.ACCEPTED).json({
					error: false,
					otp: OTP,
				});
			});
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in sending the OTP",
			error: true,
			er: error,
		});
	}
};

//TODO : Make the Secret Code Private .
exports.login = (req, res) => {
	//Finding if an account is created with the provided email .
	User.findOne({email: req.body.email}, (error, userInfo) => {
		if (error || !userInfo) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				error: true,
				message: "No account found using this email Id",
			});
		}
		bcrypt.compare(req.body.password, userInfo.password, function (err, check) {
			if (err || !check) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					error: true,
					message: "Missmatch email / password",
				});
			}

			let token = jwt.sign(
				{_id: userInfo._id, role: userInfo.role},
				"secretCode",
			);

			User.findOneAndUpdate(
				{_id: userInfo._id},
				{jwtToken: token},
				(e, userInfoWithToken) => {
					if (e) {
						return res.status(StatusCodes.BAD_REQUEST).json({
							error: true,
							message: "Error in getting the JWT Tokens",
						});
					}
					//Hidding the password
					userInfoWithToken.password = undefined;

					userInfoWithToken.jwtToken = token;

					return res.status(StatusCodes.ACCEPTED).json({
						error: false,
						message: "Successfully Logged in",
						user: userInfoWithToken,
					});
				},
			);
		});
	});
};

exports.updateNewPassword = (req, res) => {
	User.findOne({_id: req.body.userId}, (error, userInfo) => {
		if (!userInfo) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				error: true,
				message: "No user found ..",
			});
		}
		bcrypt.compare(req.body.password, userInfo.password, function (err, check) {
			if (err || !check) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					error: true,
					message: "Wrong Password",
				});
			}
			bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
				if (err) {
					return res.status(400).json({
						error: true,
						message: `Error in updating the password`,
					});
				}
				User.findByIdAndUpdate(
					{_id: userInfo._id},
					{password: hash},
					(e, updateUserInfo) => {
						if (e) {
							return res.status(StatusCodes.BAD_REQUEST).json({
								error: true,
								message: "Error in updating the Password",
							});
						}

						//Hidding the password
						updateUserInfo.password = undefined;

						return res.status(StatusCodes.ACCEPTED).json({
							error: false,
							message: "Password updated successfully",
							user: updateUserInfo,
						});
					},
				);
			});
		});
	});
};

const generateRandom4DigitOTP = () => {
	let k = 4;
	let result = "";
	while (k-- > 0) {
		result += Math.floor(Math.random() * 9);
	}
	return result;
};

exports.getOTPforPassword = async (req, res) => {
	try {
		User.find({email: req.body.email}, (error, result) => {
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			if (error || result.length === 0) {
				return res.status(200).json({
					message: "User not Found",
					error: true,
				});
			}
			let userNameMail = process.env.SENDER_EMAIL,
				applicationPassword = proccess.env.SENDER_EMAIL_PASSWORD;
			var transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: userNameMail,
					pass: applicationPassword,
				},
			});
			var OTP = generateRandom4DigitOTP();
			var mailOptions = {
				from: "hari.jsmith494@gmail.com",
				to: req.body.email,
				subject: `Forgot Password OTP`,
				html: `<p>your forgot password OTP is ${OTP}</p>`,
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					return res.status(StatusCodes.BAD_REQUEST).json({
						error: true,
						err: error,
						message: "Mail error",
					});
				}
				return res.status(StatusCodes.ACCEPTED).json({
					error: false,
					otp: OTP,
				});
			});
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in sending the OTP",
			error: true,
			er: error,
		});
	}
};

exports.updateNewPasswordViaOTP = (req, res) => {
	User.findOne({_id: req.body.userId}, (error, userInfo) => {
		if (!userInfo) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				error: true,
				message: "No user found ..",
			});
		}

		bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
			if (err) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					error: true,
					message: `Error in updating the password`,
				});
			}
			User.findByIdAndUpdate(
				{_id: userInfo._id},
				{password: hash},
				(e, updateUserInfo) => {
					if (e) {
						return res.status(StatusCodes.BAD_REQUEST).json({
							error: true,
							message: "Error in updating the Password",
						});
					}

					//Hidding the password
					updateUserInfo.password = undefined;

					return res.status(StatusCodes.ACCEPTED).json({
						error: false,
						message: "Password updated successfully",
						user: updateUserInfo,
					});
				},
			);
		});
	});
};

exports.loginUsingOTP = (req, res) => {};

exports.createAccountBySuperAdmin = async (req, res) => {
	try {
		//Checking for a user with same email Id
		let preUser = await User.findOne({email: req.body.email});
		if (preUser) {
			return res.status(StatusCodes.CONFLICT).json({
				error: true,
				message: "DUPLICATE_USER",
			});
		}
		let newUser = await new User(req.body).save();
		if (newUser.password) newUser.password = undefined;
		// await new Profile({user: newUser._id}).save();
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "Account is created Successfully",
			user: newUser,
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in creating the Account",
			error: true,
			err: error.message,
		});
	}
};
exports.createAccountByRegionalAdmin = async (req, res) => {
	try {
		//Checking for a user with same email Id
		let preUser = await User.findOne({email: req.body.email});
		if (preUser) {
			return res.status(StatusCodes.CONFLICT).json({
				error: true,
				message: "DUPLICATE_USER",
			});
		}
		let newUser = await new User(req.body).save();
		if (newUser.password) newUser.password = undefined;
		await new Profile({user: newUser._id}).save();
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "Account is created Successfully",
			user: newUser,
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in creating the Account",
			error: true,
			err: error.message,
		});
	}
};
exports.getAllUsersByRoles = async (req, res) => {
	try {
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		const results = {};
		if (endIndex < (await User.countDocuments().exec()) - 1) {
			results.next = {
				page: page + 1,
				limit: limit,
			};
		}

		if (startIndex > 0) {
			results.previous = {
				page: page - 1,
				limit: limit,
			};
		}

		results.users = await User.find({
			isDeleted: false,
			_id: {$nin: req.user._id},
			role: req.query.role,
		});
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "user fetched successfully",
			results: results,
		});
	} catch (error) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({error: false, err: error.message, message: "Error finding users"});
	}
};
exports.logout = (req, res) => {
	User.findOneAndUpdate(
		{_id: req.user._id},
		{jwtToken: null},
		(error, user) => {
			if (!user) {
				return res
					.status(StatusCodes.BAD_REQUEST)
					.json({error: true, message: "Error in finding the user Id"});
			}
			if (error) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					error: true,
					message: "Error in Logging out",
				});
			}
			res.status(StatusCodes.ACCEPTED).json({
				error: false,
				message: "Sign Out Successfully",
			});
		},
	);
};

exports.updateUser = (req, res) => {
	User.findByIdAndUpdate({_id: req.body.userId}, {$set: req.body})
		.then(() => {
			res.status(StatusCodes.OK).json({
				error: false,
				message: "User updated successfully",
			});
		})
		.catch((error) => {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				error: true,
				errorMessage: error,
			});
		});
};
