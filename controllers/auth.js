const User = require("../models/user");
const {StatusCodes, getReasonPhrase} = require("http-status-codes");


exports.isAdmin = (req, res, next) => {
	if (!req.user || req.user.role !== "admin") {
		return res.status(StatusCodes.FORBIDDEN).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};

exports.isOwner = (req, res, next) => {
	console.log(req.user,'----------------asa')
	if (!req.user || req.user.role !== "owner") {
		return res.status(StatusCodes.FORBIDDEN).json({
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
		console.log(bearerToken , req.user.jwtToken , '-----')
		if (!req.user || bearerToken !== req.user.jwtToken) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				error: true,
				message: "Un authorized access ---",
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
	if (!req.user || req.user.role !== "owner") {
		return res.status(StatusCodes.FORBIDDEN).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};

exports.isRegionalAdmin = (req, res, next) => {
	if (!req.user || req.user.role !== "regional-admin") {
		return res.status(StatusCodes.FORBIDDEN).json({
			error: true,
			message: "UnAuthorized Access",
		});
	}
	next();
};
