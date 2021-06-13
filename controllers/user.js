const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");

exports.register = (req, res) => {
	//Checking for a user with same email Id
	User.findOne({email: req.body.email}, (error, preUser) => {
		if (preUser || error) {
			return res.status(400).json({
				error: true,
				message: "A user with same email exist already",
			});
		}

		//Saving it in the Database .
		let newUser = new User(req.body);
		newUser
			.save()
			.then((newUser) => {
				//Hidding the password and returing it to the frontend .
				newUser.password = undefined;
				return res.status(200).json({
					error: false,
					message: "Account is created Successfully, Login to Continue .. ",
					user: newUser,
				});
			})
			.catch((error) => {
				return res.status(400).json({
					message: "Error in creating the Account",
					error: true,
				});
			});
	});
};

exports.verifyAccount = (req, res) => {
	try {
		User.find({email: req.body.email}, (error, result) => {
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			if (error || result.length !== 0) {
				return res.status(400).json({
					message: "Already a user found with this email",
					error: true,
				});
			}
			let userNameMail = "hari.jsmith494@gmail.com",
				applicationPassword = "fqcjwpduyiuhwgun";
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
				subject: `Verification Mail`,
				html: `<p>your verification OTP is ${OTP}</p>`,
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					return res.status(400).json({
						error: true,
						err: error,
						message: "Mail error",
					});
				}
				return res.status(200).json({
					error: false,
					otp: OTP,
				});
			});
		});
	} catch (error) {
		return res.status(400).json({
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
			return res.status(400).json({
				error: true,
				message: "No account found using this email Id",
			});
		}
		bcrypt.compare(req.body.password, userInfo.password, function (err, check) {
			if (err || !check) {
				return res.status(400).json({
					error: true,
					message: "Missmatch email / password",
				});
			}

			let token = jwt.sign({_id: userInfo._id}, "secretCode");

			User.findOneAndUpdate(
				{_id: userInfo._id},
				{jwtToken: token},
				(e, userInfoWithToken) => {
					if (e) {
						return res.status(400).json({
							error: true,
							message: "Error in getting the JWT Tokens",
						});
					}
					//Hidding the password
					userInfoWithToken.password = undefined;

					userInfoWithToken.jwtToken = token;

					//Setting req.user = logged in user Info
					req.user = userInfoWithToken;

					return res.status(200).json({
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
			return res.status(400).json({
				error: true,
				message: "No user found ..",
			});
		}
		bcrypt.compare(req.body.password, userInfo.password, function (err, check) {
			if (err || !check) {
				return res.status(400).json({
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
							return res.status(400).json({
								error: true,
								message: "Error in updating the Password",
							});
						}

						//Hidding the password
						updateUserInfo.password = undefined;

						return res.status(200).json({
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
			let userNameMail = "hari.jsmith494@gmail.com",
				applicationPassword = "fqcjwpduyiuhwgun";
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
					return res.status(400).json({
						error: true,
						err: error,
						message: "Mail error",
					});
				}
				return res.status(200).json({
					error: false,
					otp: OTP,
				});
			});
		});
	} catch (error) {
		return res.status(400).json({
			message: "Error in sending the OTP",
			error: true,
			er: error,
		});
	}
};

exports.updateNewPasswordViaOTP = (req, res) => {
	User.findOne({_id: req.body.userId}, (error, userInfo) => {
		if (!userInfo) {
			return res.status(400).json({
				error: true,
				message: "No user found ..",
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
						return res.status(400).json({
							error: true,
							message: "Error in updating the Password",
						});
					}

					//Hidding the password
					updateUserInfo.password = undefined;

					return res.status(200).json({
						error: false,
						message: "Password updated successfully",
						user: updateUserInfo,
					});
				},
			);
		});
	});
};

exports.logout = (req, res) => {
	User.findOneAndUpdate(
		{_id: req.body._id},
		{jwtToken: null},
		(error, user) => {
			if (!user) {
				return res
					.status(400)
					.json({error: true, message: "Error in finding the user Id"});
			}
			if (error) {
				return res.status(400).json({
					error: true,
					message: "Error in Logging out",
				});
			}
			res.status(200).json({
				error: false,
				message: "Sign Out Successfully",
			});
		},
	);
};

// @type middleware
// @desc To set userInfo to the req.user
exports.setUser = (req, res, next, id) => {
	if (!id) {
		return res.status(400).json({
			error: true,
			message: "user Id Not Available",
		});
	}
	User.findOne({_id: id}, (error, userInfo) => {
		if (error) {
			return res.status(400).json({
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
	if (!req.body || !req.user || req.body.jwtToken !== req.user.jwtToken) {
		return res.status(400).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};
