const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Property = require('../models/property');
const Profile = require('../models/profile');
const OTP = require("../models/otp");
const {StatusCodes} = require("http-status-codes");
const generatePassword = require("password-generator");
const {sendPasswordMailer, mailer} = require("../methods/nodemailer");
const {generateRandom4DigitOTP} = require("../methods/otpGenerate");
const Order = require("../models/order");

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
	User.findOne({email: req.body.email,isActive:true}, (error, userInfo) => {
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
					message: "Mismatch email / password",
				});
			}

			let token = jwt.sign(
				{_id: userInfo._id, role: userInfo.role},
				process.env.JWTCODE,
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
					//Hiding the password
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

exports.generateOTP = async (req, res) => {
	User.findOne({email: req.body.email,isActive:true})
		.then((userExists) => {
			if (userExists) {
				const generatedOTP = generateRandom4DigitOTP();
				let otpDetails = {
					otp: generatedOTP,
					user: userExists,
					username: req.body.email,
				};
				let newOtpDetails = new OTP(otpDetails);
				newOtpDetails
					.save()
					.then(() => {
						mailer(req.body.email, generatedOTP, "login");
						res.status(StatusCodes.OK).send({
							success: true,
							userExists: true,
							message: "OTP successfully sent",
						});
					})
					.catch((error) => {
						res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
							error: StatusCodes.INTERNAL_SERVER_ERROR,
							success: false,
							message: error,
						});
					});
			} else {
				res.status(StatusCodes.OK).send({
					success: true,
					userExists: false,
					message: "User doesn't Exist",
				});
			}
		})
		.catch((error) => {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
				error: StatusCodes.INTERNAL_SERVER_ERROR,
				success: false,
				message: error,
			});
		});
};

/**
 * @todo change collection name -OTP as OTP
 *
 */
exports.validateLoginOTP = (req, res) => {
	const {email, otp} = req.body;
	OTP.findOne({username: email})
		.populate("user", {password: 0, jwtToken: 0})
		.sort("-createdAt")
		.then((userInfo) => {
			if (userInfo.otp === otp) {
				let token = jwt.sign(
					{_id: userInfo._id, role: userInfo.role},
					process.env.JWTCODE,
				);
				User.findOneAndUpdate({email : email}, {$set: {jwtToken: token}} ,{new : true} )
					.then((updatedUser) => {
						return res.status(StatusCodes.OK).json({
							message: "OTP validated success",
							token: token,
							userInfo: updatedUser,
							error: false,
						});
					})
					.catch((error) => {
						res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
							errorMessage: error,
							error: true,
							message: "OTP cannot be validated",
						});
					});
			} else {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: "Invalid OTP",
					error: true,
				});
			}
		})
		.catch((error) => {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: error,
				error: true,
			});
		});
};

exports.validateForgotPasswordOTP = (req, res) => {
	const {email, otp} = req.body;
	OTP.findOne({username: email})
		.populate("user", {password: 0, jwtToken: 0})
		.sort("-createdAt")
		.then((userInfo) => {
			if (userInfo.otp === otp) {
				res.status(StatusCodes.OK).json({
					message: "OTP validated successfully",
					error: false,
					valid: true,
					userId: userInfo._id,
				});
			} else {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: "Invalid OTP",
					error: true,
					valid: false,
				});
			}
		})
		.catch((error) => {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				errorMessage: error,
				message: "Invalid OTP",
				error: true,
			});
		});
};
exports.updateNewPassword = (req, res) => {
	bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
		if (err) {
			return res.status(400).json({
				error: true,
				message: `Error in updating the password`,
			});
		}
		User.findByIdAndUpdate(
			{_id: req.body.userId},
			{password: hash},
			(e, updateUserInfo) => {
				if (e) {
					return res.status(StatusCodes.BAD_REQUEST).json({
						error: true,
						message: "Error in updating the Password",
					});
				}

				//Hiding the password
				updateUserInfo.password = undefined;

				return res.status(StatusCodes.ACCEPTED).json({
					error: false,
					message: "Password updated successfully",
					user: updateUserInfo,
				});
			},
		);
	});
};

exports.getOTPForPassword = async (req, res) => {
	const {email} = req.body;
	User.findOne({email: email})
		.then((userInfo) => {
			if(userInfo){
				const generatedOTP = generateRandom4DigitOTP();
			let otpDetails = {
				otp: generatedOTP,
				user: userInfo,
				username: req.body.email,
				
			};
			let newOtpDetails = new OTP(otpDetails);
			newOtpDetails
				.save()
				.then(() => {
					mailer(req.body.email, generatedOTP, "forgot password");
					res.status(StatusCodes.OK).send({
						userExists: true,
						error: false,
						message: "OTP successfully sent",
					});
				})
				.catch((error) => {
					res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
						error: true,
						err: error.message,
						message: "Error in sending the OTP",
					});
				});
			}
			else{
				res.status(StatusCodes.OK).send({
					userExists: false,
					error: false,
					message: "User doesn't exist",
				});
			}
			
		})
		.catch((error) => {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				userExists: false,
					error: true,
					message: "Internal server error",
			});
		});
};

exports.createAccountByAdmins = async (req, res) => {
	try {
		//Checking for a user with same email Id
		let preUser = await User.findOne({email: req.body.email});
		if (preUser) {
			return res.status(StatusCodes.CONFLICT).json({
				error: true,
				message: "DUPLICATE_USER",
			});
		}
		const password = generatePassword(8, false);
		let user = {
			...req.body,
			password: password,
		};
		let newUser = await new User(user).save();
		sendPasswordMailer(req.body.email, password);
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
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: false,
			err: error.message,
			message: "Error finding users",
		});
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
				message:"User not updated"
			});
		});
};

exports.updateUserInfo = async (req, res) => {
	try {
		let updatedUser = await User.findByIdAndUpdate(
			{_id: req.user._id},
			{$set: req.body},
		);
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "Updated Info Successfully",
			user: updatedUser,
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			message: "Error in updating the User Info ",
			err: error.message,
		});
	}
};

exports.getSubscriptionInfo = async (req,res) => {
	try{

		let userInfo = await User.findOne({_id :req.user._id}).populate('subscription').populate({path : "subscription" , populate :'property'}) ;
		return res.status(StatusCodes.OK).json({
			error : false ,
			message : "Success" ,
			user : userInfo 
		})
	}
	catch(error){
		return res.status(StatusCodes.BAD_REQUEST).json({
			error : true ,
			err : error.message ,
			message :"Subscription Info error"
		})
	}


}

exports.getAdminDashboardInfo = async(req,res) => {
	try{
		let tenantCount = await User.find({isDeleted : false  , role : "tenant"}).countDocuments() ;
		let adminCount = await User.find({isDeleted : false , role :"admin"}).countDocuments() ;
		let regionalAdminCount = await User.find({isDeleted : false  ,role : "regional-admin"}).countDocuments() ;
		let ownerCount = await User.find({isDeleted : false , role : "owner" }).countDocuments() ;
		let propertyCount = await Property.find({isDeleted : false }).countDocuments() ;
		return res.status(StatusCodes.OK).json({
			error : false ,
			message : "success" ,
			result : [{title : "Admins" , count : adminCount},{title : "Regional Admins" , count : regionalAdminCount},{title : "House Owners" , count : ownerCount},{title : "Tenants" , count : tenantCount},{title : "Properties" ,count  : propertyCount }]
		})
	}catch(error){
		return res.status(StatusCodes.BAD_REQUEST).json({
			error : true ,
			err : error.message ,
			message : "Error in getting dashboard Info"
		})
	}
	
}

exports.getRegionalAdminInfo = async (req,res) => {
	try{
		let tenantCount = await User.find({isDeleted : false  , role : "tenant" },{$in : {regions : req.user.regions[0]}}).countDocuments() ;
		let ownerCount = await User.find({isDeleted : false , role : "owner"},{$in : {regions : req.user.regions[0]}}).countDocuments() ;
		let propertyCount = await Property.find({isDeleted : false , region : req.user.regions[0]}).countDocuments();
		return res.status(StatusCodes.OK).json({
			error : false ,
			message : "success" ,
			result : [{title : "House Owners" , count : ownerCount},{title : "Tenants" , count : tenantCount},{title : "Properties" , count : propertyCount}]
		})
	}catch(error){
		return res.status(StatusCodes.BAD_REQUEST).json({
			error : true ,
			err : error.message ,
			message : "Error in getting dashboard Info"
		})
	}
}

exports.getOwnerDashboardInfo = async (req,res) => {
	try{
		let propertyCount = await Property.find({isDeleted : false , owner : req.user._id}).countDocuments();
		
		return res.status(StatusCodes.OK).json({
			error : false ,
			message : "success" ,
			result : [{title : "Properties" , count : propertyCount}]
		})
	}catch(error){
		return res.status(StatusCodes.BAD_REQUEST).json({
			error : true ,
			err : error.message ,
			message : "Error in getting dashboard Info"
		})
	}
}

exports.tenantDashboardInfo = async(req,res) => {
	try{
		let userInfo = await User.findOne({_id :req.user._id},{jwtToken : 0 , password : 0}).populate('subscription').populate({path : "subscription" , populate :'property'});
		let pendingOrders = [] ;
		if(userInfo?.subscription?.billingCycle > 0){
			pendingOrders = await Order.find({user : req.user._id , paymentStatus:"Pending"});
		}
		return res.status(StatusCodes.OK).json({
			error : false ,
			message : "Success" ,
			result : {
				user : userInfo ,
				pendingOrders : pendingOrders
			} 
		})
	}
	catch(error){
		return res.status(StatusCodes.BAD_REQUEST).json({
			error : true ,
			err : error.message ,
			message :"Subscription Info error"
		})
	}
}

exports.getUserInfo = async(req,res) => {
	try{	
		let profile = await Profile({user : req.user._id});
		req.user.jwtToken = undefined;
		return res.status(400).json({
			message : "success" ,
			error : false ,
			user : req.user ,
			profile : profile
		});
	}catch(error){
		console.log(error);
		return res.status(StatusCodes.OK).json({
			error : true ,
			err : error.message ,
			message : "Error in getting user profile ."
		});
	};
}