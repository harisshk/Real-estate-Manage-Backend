// @type middleware

const {StatusCodes} = require("http-status-codes");

const User = require("../models/user");

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

exports.isAdmin = (req, res, next) => {
	if (!req.body || !req.user || req.user.role !== "admin") {
		return res.status(StatusCodes.BAD_REQUEST).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};
