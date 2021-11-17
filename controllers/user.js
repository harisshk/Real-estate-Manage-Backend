const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const ParentProperty = require('../models/parentProperty');
const SubProperty = require('../models/subProperty');
const Profile = require('../models/profile');
const OTP = require("../models/otp");
const { StatusCodes } = require("http-status-codes");
const generatePassword = require("password-generator");
const { sendPasswordMailer, mailer, sendMail } = require("../methods/nodemailer");
const { generateRandom4DigitOTP } = require("../methods/otpGenerate");
const Order = require("../models/order");
const Support = require("../models/support");
const { addActivitiesUser } = require("../utils/logHandler/index")
const { createRazorPayCustomer } = require('../methods/razorPayCustomer')
exports.register = async (req, res) => {
	try {
		//Checking for a user with same email Id
		let preUser = await User.findOne({ email: req.body.email });
		if (preUser) {
			return res.status(StatusCodes.CONFLICT).json({
				error: true,
				message: "DUPLICATE_USER",
			});
		}
		let newUser = await new User(req.body).save();
		newUser.password = undefined;
		addActivitiesUser(newUser._id, req.user._id, `New ${newUser.role} ${newUser.name} added by ${req.user.name}(${req.user.role})`)
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
		User.find({ email: req.body.email }, (error, result) => {
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
			let { email } = req.body;
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
	User.findOne({ email: req.body.email, isActive: true }, (error, userInfo) => {
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
				{ _id: userInfo._id, role: userInfo.role },
				process.env.JWTCODE,
			);

			User.findOneAndUpdate(
				{ _id: userInfo._id },
				{ jwtToken: token },
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
	User.findOne({ email: req.body.email })
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
						res.status(StatusCodes.BAD_REQUEST).send({
							error: StatusCodes.BAD_REQUEST,
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
			res.status(StatusCodes.BAD_REQUEST).send({
				error: StatusCodes.BAD_REQUEST,
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
	const { email, otp } = req.body;
	OTP.findOne({ username: email })
		.populate("user", { password: 0, jwtToken: 0 })
		.sort("-createdAt")
		.then((userInfo) => {
			if (userInfo.otp === otp) {
				let token = jwt.sign(
					{ _id: userInfo._id, role: userInfo.role },
					process.env.JWTCODE,
				);
				User.findOneAndUpdate({ email: email }, { $set: { jwtToken: token } }, { new: true })
					.then((updatedUser) => {
						return res.status(StatusCodes.OK).json({
							message: "OTP validated success",
							token: token,
							userInfo: updatedUser,
							error: false,
						});
					})
					.catch((error) => {
						res.status(StatusCodes.BAD_REQUEST).json({
							errorMessage: error,
							error: true,
							message: "OTP cannot be validated",
						});
					});
			} else {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: "Invalid OTP",
					error: true,
				});
			}
		})
		.catch((error) => {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: error,
				error: true,
			});
		});
};

exports.validateForgotPasswordOTP = (req, res) => {
	const { email, otp } = req.body;
	OTP.findOne({ username: email })
		.populate("user", { password: 0, jwtToken: 0 })
		.sort("-createdAt")
		.then((userInfo) => {
			if (userInfo.otp === otp) {
				res.status(StatusCodes.OK).json({
					message: "OTP validated successfully",
					error: false,
					valid: true,
					userId: userInfo.user._id,
				});
			} else {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: "Invalid OTP",
					error: true,
					valid: false,
				});
			}
		})
		.catch((error) => {
			res.status(StatusCodes.BAD_REQUEST).json({
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
			{ _id: req.body.userId },
			{ password: hash },
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
	const { email } = req.body;
	User.findOne({ email: email })
		.then((userInfo) => {
			if (userInfo) {
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
						res.status(StatusCodes.BAD_REQUEST).json({
							error: true,
							err: error.message,
							message: "Error in sending the OTP",
						});
					});
			}
			else {
				res.status(StatusCodes.OK).send({
					userExists: false,
					error: false,
					message: "User doesn't exist",
				});
			}

		})
		.catch((error) => {
			res.status(StatusCodes.BAD_REQUEST).json({
				userExists: false,
				error: true,
				message: "Internal server error",
			});
		});
};

exports.createAccountByAdmins = async (req, res) => {
	const { email, phoneNumber, name, role } = req.body
	try {
		//Checking for a user with same email Id
		let preUser = await User.findOne({ email: email });
		if (preUser) {
			return res.status(StatusCodes.CONFLICT).json({
				error: true,
				message: "DUPLICATE_USER",
			});
		}
		const password = generatePassword(8, false);
		var razorPayCustomerDetails
		if (role === "owner") {
			razorPayCustomerDetails = await createRazorPayCustomer({
				email: email,
				name: name,
				phoneNumber: phoneNumber
			})

		}
		let user = {
			...req.body,
			password: password,
			payoutsContactId: razorPayCustomerDetails?.id
		};
		let newUser = await new User(user).save();
		// 	sendPasswordMailer(email, password);
		// 	let body = `<p>New User Created</p>
		// 	<p>Name: ${newUser.name}</p>
		// 	<p>Role: ${newUser.role}</p>
		// 	<p>&nbsp;</p>
		// 	<p>- Account Created By ${req.user.name}</p>`;
		// let subject = `!! PROPY New User Added`;
		// let allAdmins = await User.find({role: "admin", isActive: true });
		// if (role === "regional-admin"){
		// 		// for(let i = 0 ; i < allAdmins.length ; i++){
		// 			sendMail ('hari850800@gmail.com', subject ,body);
		// 		// }
		// 	}
		const userId = newUser?._id
		const adminId = req.user?._id
		const region = newUser?.regions[0]
		const message = newUser?.role === "tenant" ? `New ${newUser?.role} ${newUser?.name}  added` : `New ${newUser?.role} added `
		addActivitiesUser(
			userId,
			adminId,
			region,
			message
		)
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
			_id: { $nin: req.user._id },
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

exports.getUsersByRegionAdmin = async (req, res) => {
	try {
		const { regions } = req.user
		const { role } = req.query
		const results = await User.find({ role: role, regions: { $in: regions[0] } })
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
}
exports.logout = (req, res) => {
	User.findOneAndUpdate(
		{ _id: req.user._id },
		{ jwtToken: null },
		(error, user) => {
			if (!user) {
				return res
					.status(StatusCodes.BAD_REQUEST)
					.json({ error: true, message: "Error in finding the user Id" });
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
	const { name, phoneNumber, role, regions } = req.body
	User.findByIdAndUpdate({ _id: req.body.userId }, { $set: req.body }, { name: 1, email: 1, role: 1, regions: 1, phoneNumber: 1 })
		.then((updatedUserInfo) => {
			let changes = []

			/**
			 * Iterating Object one by one and comparing it with the body if any changes found push them to changes array.
			 */
			// for (const item in updatedUserInfo?._doc) {
			// 	if (req?.body[item] && updatedUserInfo[item] !== req?.body[item]) {
			// 		if (item === "regions") {
			// 			if (updatedUserInfo?._doc[item][0] !== req?.body[item][0]) {
			// 				changes.push(item);
			// 			}
			// 		} else {
			// 			changes.push(item);
			// 		}
			// 	};
			// };
			if (role !== updatedUserInfo?.role && role) {
				changes.push(" Role")
			}
			if (phoneNumber !== updatedUserInfo?.phoneNumber && phoneNumber) {
				changes.push(" Phone Number")
			}
			if (name !== updatedUserInfo?.name && name) {
				changes.push(" Name")
			}
			if (regions?.toString() !== updatedUserInfo?.regions?.toString() && regions) {
				changes.push(" Region")
			}
			if (changes.length !== 0) {
				const userId = updatedUserInfo?._id;
				const adminId = req.user?._id;
				const region = updatedUserInfo?.regions[0];
				const newActivity = updatedUserInfo?.name + " Profile has been updated by " + req?.user?.name + "(" + req?.user?.role + ")." + (changes.length !== 0 ? "\nChanges : " + changes.toString() : "");
				addActivitiesUser(
					userId,
					adminId,
					region,
					newActivity
				);
			}
			res.status(StatusCodes.OK).json({
				error: false,
				message: "User updated successfully",
			});
		})
		.catch((error) => {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: true,
				errorMessage: error.message,
				message: "User not updated"
			});
		});
};

exports.updateUserInfo = async (req, res) => {
	try {
		let updatedUser = await User.findByIdAndUpdate(
			{ _id: req.user._id },
			{ $set: req.body },
			{ new: true }
		);
		updatedUser.password = undefined;
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

exports.getSubscriptionInfo = async (req, res) => {
	try {
		let userInfo = await User.findOne({ _id: req.user._id }).populate('subscription').populate({ path: "subscription", populate: 'property' });
		return res.status(StatusCodes.OK).json({
			error: false,
			message: "Success",
			user: userInfo
		})
	}
	catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			err: error.message,
			message: "Subscription Info error"
		})
	}


}

exports.getAdminDashboardInfo = async (req, res) => {
	try {
		let tenantCount = await User.find({ isDeleted: false, role: "tenant" }).countDocuments();
		// let adminCount = await User.find({isDeleted : false , role: "admin" }).countDocuments() ;
		let regionalAdminCount = await User.find({ isDeleted: false, role: "regional-admin" }).countDocuments();
		let ownerCount = await User.find({ isDeleted: false, role: "owner" }).countDocuments();
		let propertyCount = await ParentProperty.find({ isDeleted: false }).countDocuments();
		let supportRequestCount = await Support.find({ isActive: true }).countDocuments();
		let pendingDueCount = await Order.find({ paymentStatus: "Pending" }).countDocuments();
		const count = await Order.aggregate([
			{
				$match: {
					$expr: {
						$eq: [{ $month: '$createdAt' }, { $month: new Date() }],
					},
				}
			},
			{
				$group: {
					_id: "$paymentStatus",
					total: { $sum: "$amount" },
				}
			},
		])
		if (count.length > 0) {
			if (count.length === 2) {
				var outOff = count[0]?.total + count[1]?.total;
			} else {
				var outOff = count[0]?.total
			}
			var value = count.find(x => x._id === "Done")?.total;
			var percentage = (value * 100) / outOff;
		}
		else {
			var outOff = 0
			var percentage = 0
		}
		const supportGraph = await Support.aggregate([
			{
			  $group: {
				 // Group by both month and year of the support
				_id: {
				  month: { $month: "$createdAt" },
				  year: { $year: new Date() }, // finds the current year
				},
				// Count the no of support
				count: {
				  $sum: 1
				}
			  }
			},
		])
		return res.status(StatusCodes.OK).json({
			error: false,
			message: "success",
			result: [
				// {
				// 	title : "Admins", 
				// 	count : adminCount
				// },
				{
					title: "Regional Admins",
					count: regionalAdminCount
				},
				{
					title: "House Owners",
					count: ownerCount
				},
				{
					title: "Tenants",
					count: tenantCount
				},
				{
					title: "Properties",
					count: propertyCount
				},
				{
					title: 'Active Tickets Raised',
					count: supportRequestCount
				},
				{
					title: "Pending Due",
					count: pendingDueCount,
				},
			],
			reports: {
				paidPercentage: {
					percentage: percentage.toFixed(0),
					total: outOff,
					paid: value ? value : 0
				},
				supportGraph: supportGraph
			}
		})
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			err: error.message,
			message: "Error in getting dashboard Info"
		})
	}

}
exports.getAdminDashboardFilterByRegion = async (req, res) => {
	const { region } = req.params
	try {
		let tenantCount = await User.find({ isDeleted: false, role: "tenant", regions: region }).countDocuments();
		// let adminCount = await User.find({isDeleted : false , role: "admin" }).countDocuments() ;
		let regionalAdminCount = await User.find({ isDeleted: false, role: "regional-admin", regions: region }).countDocuments();
		let ownerCount = await User.find({ isDeleted: false, role: "owner", regions: region }).countDocuments();
		let propertyCount = await ParentProperty.find({ isDeleted: false, region: region }).countDocuments();
		let supportRequestCount = await Support.find({ isActive: true, region: region }).countDocuments();
		//let pendingDueCount = await Order.find({paymentStatus: "Pending" }).countDocuments();
		return res.status(StatusCodes.OK).json({
			error: false,
			message: "success",
			result: [
				// {
				// 	title : "Admins", 
				// 	count : adminCount
				// },
				{
					title: "Regional Admins",
					count: regionalAdminCount
				},
				{
					title: "House Owners",
					count: ownerCount
				},
				{
					title: "Tenants",
					count: tenantCount
				},
				{
					title: "Properties",
					count: propertyCount
				},
				{
					title: 'Active Tickets Raised',
					count: supportRequestCount
				},
			]
		})
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			err: error.message,
			message: "Error in getting dashboard Info"
		})
	}

}

exports.getRegionalAdminInfo = async (req, res) => {
	try {
		let tenantCount = await User.find({ isDeleted: false, role: "tenant", regions: { $in: req.user.regions[0] } }).countDocuments();
		let ownerCount = await User.find({ isDeleted: false, role: "owner", regions: { $in: req.user.regions[0] } }).countDocuments();
		let propertyCount = await ParentProperty.find({ isDeleted: false, region: req.user.regions[0] }).countDocuments();
		let supportRequestCount = await Support.find({ isActive: true, region: req.user.regions[0] }).countDocuments();
		let pendingDueCount = await Order.find({ paymentStatus: "Pending", region: req.user.regions[0] }).countDocuments();
		const count = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: [{ $month: '$createdAt', }, { $month: new Date() },] },
							{ $eq: ["$region", req.user.regions[0]] },
						]
					},
				}
			},
			{
				$group: {
					_id: "$paymentStatus",
					total: { $sum: "$amount" },
				}
			},
		])
		if (count.length > 0) {
			if (count.length === 2) {
				var outOff = count[0]?.total + count[1]?.total;
			} else {
				var outOff = count[0]?.total
			}
			var value = count.find(x => x._id === "Done")?.total;
			var percentage = (value * 100) / outOff;
		}
		else {
			var outOff = 0
			var percentage = 0
		}
		
		const supportGraph = await Support.aggregate([
			{
				$match: {
					$expr: {
						$eq: ["$region",req.user.regions[0]],
					},
				}
			},
			{
			  $group: {
				 // Group by both month and year of the support
				_id: {
				  month: { $month: "$createdAt" },
				  year: { $year: new Date() }, 
				
				  // finds the current year
				},

				// Count the no of support
				count: {
				  $sum: 1
				}
			  }
			},
		])
		return res.status(StatusCodes.OK).json({
			error: false,
			message: "success",
			result: [
				{
					title: "House Owners",
					count: ownerCount
				},
				{
					title: "Tenants",
					count: tenantCount
				},
				{
					title: "Properties",
					count: propertyCount
				},
				{
					title: 'Active Tickets Raised',
					count: supportRequestCount
				},
				{
					title: 'Pending Due',
					count: pendingDueCount
				}
			],
			reports: {
				paidPercentage: {
					percentage: percentage.toFixed(0),
					total: outOff,
					paid: value ? value : 0
				},
				supportGraph: supportGraph
			}
		})
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			err: error.message,
			message: "Error in getting dashboard Info"
		})
	}
}

exports.getOwnerDashboardInfo = async (req, res) => {
	try {
		let propertyCount = await SubProperty.find({ isDeleted: false, owner: req.user._id }).countDocuments();
		let pendingDueCount = await Order.find({ paymentStatus: "Pending", owner: req.user._id }).countDocuments();
		let supportCount = await Support.find({ owner: req.user._id }).countDocuments();
		let occupiedCount = await SubProperty.find({ isDeleted: false, owner: req.user._id, isOccupied: true }).countDocuments();
			
		const supportGraph = await Support.aggregate([
			{
				$match: {
					$expr: {
						$eq: ["$owner",req.user._id],
					},
				}
			},
			{
			  $group: {
				 // Group by both month and year of the support
				_id: {
				  month: { $month: "$createdAt" },
				  year: { $year: new Date() }, 
				
				  // finds the current year
				},

				// Count the no of support
				count: {
				  $sum: 1
				}
			  }
			},
		])
		const count = await Order.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{ $eq: [{ $month: '$createdAt', }, { $month: new Date() },] },
							{ $eq: ["$owner", req.user._id] },
						]
					},
				}
			},
			{
				$group: {
					_id: "$paymentStatus",
					total: { $sum: "$amount" },
				}
			},
		])
		if (count.length > 0) {
			if (count.length === 2) {
				var outOff = count[0]?.total + count[1]?.total;
			} else {
				var outOff = count[0]?.total
			}
			var value = count.find(x => x._id === "Done")?.total;
			var percentage = (value * 100) / outOff;
		}
		else {
			var outOff = 0
			var percentage = 0
		}
		
		return res.status(StatusCodes.OK).json({
			error: false,
			message: "success",
			result: [
				{
					title: "Properties",
					count: propertyCount
				},
				{
					title: "Pending Due",
					count: pendingDueCount
				},
				{
					title: "Tickets Raised",
					count: supportCount
				}
			],
			reports:{
				paidPercentage: {
					percentage: percentage.toFixed(0),
					total: outOff,
					paid: value ? value : 0
				},
				occupancy: {
					occupied: occupiedCount,
					unoccupied: propertyCount - occupiedCount
				},
				supportGraph: supportGraph,

			}
		})
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			err: error.message,
			message: "Error in getting dashboard Info"
		})
	}
}

exports.tenantDashboardInfo = async (req, res) => {
	try {
		let userInfo = await User.findOne({ _id: req.user._id }, { jwtToken: 0, password: 0 }).populate('subscription')
			.populate({
				path: "subscription",
				populate: {
					path: 'property',
					populate: "parentId"
				}
			});
		let pendingOrders = [];
		if (userInfo?.subscription?.billingCycle > 0) {
			pendingOrders = await Order.find({ user: req.user._id, paymentStatus: "Pending" });
		}
		return res.status(StatusCodes.OK).json({
			error: false,
			message: "Success",
			result: {
				user: userInfo,
				pendingOrders: pendingOrders
			}
		})
	}
	catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			err: error.message,
			message: "Subscription Info error"
		})
	}
}

exports.getUserInfo = async (req, res) => {
	try {
		let profile = await Profile.findOne({ user: req.user._id }).populate("rejectedBy")
		req.user.jwtToken = undefined;
		return res.status(StatusCodes.OK).json({
			message: "success",
			error: false,
			user: req.user,
			profile: profile
		});
	} catch (error) {
		return res.status(StatusCodes.OK).json({
			error: true,
			err: error.message,
			message: "Error in getting user profile ."
		});
	};
}

exports.getUsersForAssignAdmin = async (req, res) => {
	const { role } = req.body
	try {
		let users = await User.find({ role: role, isDeleted: false, isActive: true }, { email: 1, phoneNumber: 1, name: 1, subscription: 1 })
		return res.status(StatusCodes.OK).json({
			message: "success",
			error: false,
			user: req.user,
			users: users
		});
	} catch (error) {
		return res.status(StatusCodes.OK).json({
			error: true,
			err: error.message,
			message: "Error in getting users ."
		});
	};
}
exports.getUsersForAssignRegionalAdmin = async (req, res) => {
	const { role } = req.body
	try {
		let users = await User.find({ role: role, regions: req.user.regions[0], isDeleted: false, isActive: true }, { email: 1, phoneNumber: 1, name: 1, subscription: 1 })
		return res.status(StatusCodes.OK).json({
			message: "success",
			error: false,
			user: req.user,
			users: users
		});
	} catch (error) {
		return res.status(StatusCodes.OK).json({
			error: true,
			err: error.message,
			message: "Error in getting users ."
		});
	};
}
exports.getTenantsForAssignRegionalAdmin = async (req, res) => {
	const { role } = req.body
	try {
		let users = await User.find({ role: role, isDeleted: false, isActive: true }, { email: 1, phoneNumber: 1, name: 1, subscription: 1 })
		return res.status(StatusCodes.OK).json({
			message: "success",
			error: false,
			user: req.user,
			users: users
		});
	} catch (error) {
		return res.status(StatusCodes.OK).json({
			error: true,
			err: error.message,
			message: "Error in getting users ."
		});
	};
}
exports.getOwnersByRegion = async (req, res) => {
	const { regions } = req.params
	try {
		let users = await User.find({ regions: regions, isDeleted: false, isActive: true, role: "owner" }, { fcmToken: 0, jwtToken: 0, password: 0 })
		return res.status(StatusCodes.OK).json({
			message: "success",
			error: false,
			user: req.user,
			users: users
		});
	} catch (error) {
		return res.status(StatusCodes.OK).json({
			error: true,
			err: error.message,
			message: "Error in getting users ."
		});
	};
}

