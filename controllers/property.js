const {StatusCodes} = require("http-status-codes");
const Property = require("../models/property");

exports.addProperty = async (req, res) => {
	try {
		req.body.user = req.user._id;
		let newProperty = await new Property(req.body).save();

		return res.status(StatusCodes.ACCEPTED).json({
			message: "Property added",
			error: false,
			property: newProperty,
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in adding the property ",
			error: true,
			err: error.message,
		});
	}
};

exports.updateProperty = (req, res) => {
	Property.findOne({_id: req.params.propertyId}, {$set: req.body})
		.then((response) => {
			return res.status(StatusCodes.ACCEPTED).json({
				message: "Property updated",
				error: false,
			});
		})
		.catch((error) =>
			res.status(StatusCodes.BAD_REQUEST).json({
				message: "Error in updating the property ",
				error: true,
				err: error,
			}),
		);
};

exports.deleteProperty = (req, res) => {
	Property.findOne(
		{_id: req.params.propertyId},
		{$set: {isDelete: true, deletedBy: req.user._id}},
	)
		.then((response) => {
			return res.status(StatusCodes.ACCEPTED).json({
				message: "Property deleted",
				error: false,
			});
		})
		.catch((error) =>
			res.status(StatusCodes.BAD_REQUEST).json({
				message: "Error in deleting the property ",
				error: true,
				err: error,
			}),
		);
};

exports.getProperties = async (req, res) => {
	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);

	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const results = {};

	if (endIndex < (await Property.countDocuments().exec())) {
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
	try {
		results.results = await Property.find({
			isActive: true,
			isDelete: false,
			isVerified: req.params.isVerified,
		})
			.limit(limit)
			.skip(startIndex)
			.exec();
		res
			.status(StatusCodes.BAD_REQUEST)
			.json({error: false, properties: results});
	} catch (error) {
		res
			.status(StatusCodes.BAD_REQUEST)
			.json({error: true, message: error.message});
	}
};

exports.approveProperty = async (req, res) => {
	let update = {isVerified: true, verifiedBy: req.user._id};
	try {
		await Property.findOneAndUpdate(
			{_id: req.params.propertyId},
			{$set: update},
			{new: true},
		).exec();
		return res
			.status(StatusCodes.ACCEPTED)
			.json({error: false, message: "Property Approved"});
	} catch (error) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({error: true, message: error.message});
	}
};

exports.disApproveProperty = async (req, res) => {
	let update = {isVerified: false, verifiedBy: req.user._id};
	try {
		await Property.findOneAndUpdate(
			{_id: req.params.propertyId},
			{$set: update},
			{new: true},
		).exec();
		return res
			.status(StatusCodes.ACCEPTED)
			.json({error: false, message: "Property Dis-Approved"});
	} catch (error) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({error: true, message: error.message});
	}
};
