const Property = require("../models/property");

exports.addProperty = (req, res) => {
	req.body.user = req.user._id;
	let newProperty = new Property(req.body);
	newProperty
		.save()
		.then((response) => {
			return res.status(200).json({
				message: "Property added",
				error: false,
			});
		})
		.catch((error) =>
			res.status(400).json({
				message: "Error in adding the property ",
				error: true,
				err: error,
			}),
		);
};

exports.updateProperty = (req, res) => {
	Property.findOne({_id: req.params.propertyId}, {$set: req.body})
		.then((response) => {
			return res.status(200).json({
				message: "Property updated",
				error: false,
			});
		})
		.catch((error) =>
			res.status(400).json({
				message: "Error in updating the property ",
				error: true,
				err: error,
			}),
		);
};

exports.deleteProperty = (req, res) => {
	Property.findOne({_id: req.params.propertyId}, {$set: {isDelete: true}})
		.then((response) => {
			return res.status(200).json({
				message: "Property deleted",
				error: false,
			});
		})
		.catch((error) =>
			res.status(400).json({
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
		res.status(200).json({error: false, properties: results});
	} catch (error) {
		res.status(400).json({error: true, message: error.message});
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
		return res.status(200).json({error: false, message: "Property Approved"});
	} catch (error) {
		return res.status(400).json({error: true, message: error.message});
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
			.status(200)
			.json({error: false, message: "Property Dis-Approved"});
	} catch (error) {
		return res.status(400).json({error: true, message: error.message});
	}
};

