const Property = require("../models/property");

exports.addProperty = (req, res) => {
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
