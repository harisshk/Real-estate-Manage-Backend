const { StatusCodes } = require("http-status-codes");
const { sendMail } = require("../methods/nodemailer");
const Property = require("../models/property");
const ParentProperty = require("../models/parentProperty");
const SubProperty = require("../models/subProperty")
const User = require("../models/user");
const { addActivitiesUser } = require('../utils/logHandler/index')
const { MainPropertyDiff, subPropertyDiff } = require('../utils/compareDiff/index')


exports.addProperty = async (req, res) => {
	const { parentProperty, subProperty } = req.body
	try {
		let newProperty = await new ParentProperty(parentProperty).save();
		const { _id, createdBy } = newProperty
		let childId = []
		let successRate = 0
		subProperty.forEach(async (property) => {
			let newChild = await new SubProperty({
				...property,
				parentId: _id,
				createdBy: createdBy
			}).save()
			childId.push(newChild._id)
			successRate += 1
			if (successRate === subProperty?.length) {
				await ParentProperty.findByIdAndUpdate({ _id: _id }, { subProperty: childId })
			}
		});

		// let body = `<p>New Property Added</p>
		// <p>${newProperty.name}&nbsp;</p>
		// <p style="text-align: center;"><img src=${newProperty?.photos[0]} alt="" width="421" height="280" /></p>
		// <p>Property Location</p>
		// <p>&nbsp; &nbsp;${newProperty?.addressLine1},</p>
		// <p>&nbsp; &nbsp;${newProperty?.addressLine2 || ''}</p>
		// <p>&nbsp; &nbsp;${newProperty?.zipCode}, ${newProperty?.region}.</p>
		// <p>&nbsp; &nbsp;${newProperty?.state}</p>
		// <p>Rent: ${newProperty.rent} Rs</p>
		// <p>Initial Deposit: ${newProperty.initialDeposit} Rs</p>
		// <p>Square Feet: ${newProperty.size} ft</p>
		// <p>Added By ${req.user.name}-(${req?.user?.regions[0]})</p>
		// <p>&nbsp;&nbsp;</p>`;
		// let subject = `!! PROPY New Property Added`;
		// let allAdmins = await User.find({role : "admin" , isActive : true});
		// for(let i = 0 ; i < allAdmins.length ; i++){
		//     sendMail (allAdmins[i].email, subject ,body);
		// }
		const userId = ""
		const adminId = req?.user?._id
		const region = newProperty?.region
		const message = `New property - ${newProperty?.name} is created by ${req?.user?.name} `
		addActivitiesUser(
			userId,
			adminId,
			region,
			message
		)
		return res.status(StatusCodes.ACCEPTED).json({
			message: "Property added",
			error: false,
			property: newProperty,
			successRate: successRate,
			childId: childId
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in adding the property ",
			error: true,
			err: error.message,
		});
	}
};


exports.updateProperty = async (req, res) => {
	const { parentProperty, subProperty } = req.body
	try {
		let updatedProperty = await ParentProperty.findByIdAndUpdate({ _id: parentProperty._id }, { $set: parentProperty });
		const changes = await (MainPropertyDiff(parentProperty,updatedProperty))
		if (changes.length !== 0) {
			const userId = req?.user?._id
			const adminId = req?.user?._id
			const region = updatedProperty?.region
			const message = "Property - " + updatedProperty?.name + " is updated by " + req?.user?.name + "." + (changes.length !== 0 ? "\nChanges : " + changes.toString() : "");
			addActivitiesUser(
				userId,
				adminId,
				region,
				message
			)
		}
		const { _id, updatedBy } = updatedProperty
		let childId = []
		let successRate = 0
		subProperty.forEach(async (property) => {
			if (property?._id) {
				const data = {
					...property,
					parentId: _id,
					updatedBy: req.user._id,
				}
				let updatedChild = await SubProperty.findOneAndUpdate({ _id: property?._id }, { $set: data }, { upsert: true })
				childId.push(updatedChild._id)
				const changes = await (subPropertyDiff(updatedChild, property))
				if (changes.length !== 0) {
					const userId = property?.owner
					const adminId = req?.user?._id
					const region = updatedProperty?.region
					const message = "Property - " + updatedProperty?.name + " - " + property?.name + " is updated by " + req?.user?.name + "." + (changes.length !== 0 ? "\nChanges : " + changes.toString() : "");
					addActivitiesUser(
						userId,
						adminId,
						region,
						message
					)
				}
			} else {
				const data = {
					...property,
					parentId: _id,
					createdBy: req.user._id,
				}
				let updatedChild = await new SubProperty(data).save()
				childId.push(updatedChild._id)
				const changes = await (subPropertyDiff(updatedChild, property))
				if (changes.length !== 0) {
					const userId = property?.owner
					const adminId = req?.user?._id
					const region = updatedProperty?.region
					const message = "Property - " + updatedProperty?.name + " - " + property?.name + " is updated by " + req?.user?.name + "." + (changes.length !== 0 ? "\nChanges : " + changes.toString() : "");
					addActivitiesUser(
						userId,
						adminId,
						region,
						message
					)
				}
			}
			successRate += 1
			if (successRate === subProperty?.length) {
				await ParentProperty.findByIdAndUpdate({ _id: _id }, { subProperty: childId })
			}

		});

		// let body = `<p>New Property Added</p>
		// <p>${newProperty.name}&nbsp;</p>
		// <p style="text-align: center;"><img src=${newProperty?.photos[0]} alt="" width="421" height="280" /></p>
		// <p>Property Location</p>
		// <p>&nbsp; &nbsp;${newProperty?.addressLine1},</p>
		// <p>&nbsp; &nbsp;${newProperty?.addressLine2 || ''}</p>
		// <p>&nbsp; &nbsp;${newProperty?.zipCode}, ${newProperty?.region}.</p>
		// <p>&nbsp; &nbsp;${newProperty?.state}</p>
		// <p>Rent: ${newProperty.rent} Rs</p>
		// <p>Initial Deposit: ${newProperty.initialDeposit} Rs</p>
		// <p>Square Feet: ${newProperty.size} ft</p>
		// <p>Added By ${req.user.name}-(${req?.user?.regions[0]})</p>
		// <p>&nbsp;&nbsp;</p>`;
		// let subject = `!! PROPY New Property Added`;
		// let allAdmins = await User.find({role : "admin" , isActive : true});
		// for(let i = 0 ; i < allAdmins.length ; i++){
		//     sendMail (allAdmins[i].email, subject ,body);
		// }
		
		return res.status(StatusCodes.ACCEPTED).json({
			message: "Property updated",
			error: false,
			successRate: successRate,
			childId: childId
		});
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in updating the property ",
			error: true,
			err: error.message,
		});
	}
};

exports.deleteProperty = (req, res) => {
	Property.findOne(
		{ _id: req.params.propertyId },
		{ $set: { isDelete: true, deletedBy: req.user._id } },
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
	try {
		const results = await ParentProperty.find({
			isActive: true,
			isDeleted: false,
		}).populate({
			path: "subProperty",
			populate: "owner"
		})
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ error: false, properties: results });
	} catch (error) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ error: true, message: error.message });
	}
};

exports.getPropertiesByAdmin = async (req, res) => {
	try {
		let properties = await ParentProperty.find({ isDeleted: false, isActive: true })
			.populate({
				path: "subProperty",
				populate: {
					path: "owner",
					select: "name email phoneNumber"
				},
			})
			.populate("createdBy")
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "Properties Fetched Successfully",
			properties: properties,
		})
	}
	catch (error) {
		console.log(error)
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in fetching the property ",
			error: true,
			err: error.message,
		});
	}
};

exports.getPropertiesByRegionalAdmin = async (req, res) => {
	try {
		let properties = await ParentProperty.find({ isDeleted: false, isActive: true, region: req.user.regions[0] })
			.populate({
				path: "subProperty",
				populate: {
					path: "owner",
					select: "name email phoneNumber"
				},
			})
			.populate("createdBy")
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "Properties Fetched Successfully",
			properties: properties,
		})
	}
	catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error fetching property ",
			error: true,
			err: error.message,
		});
	}
};

exports.getPropertyInfo = async (req, res) => {
	const { propertyId } = req.params;
	try {
		let propertyInfo = await SubProperty.findOne({ _id: propertyId }).populate("owner").populate("parentId")
			.populate('subscription')
			.populate('currentSubscription')

		return res.status(StatusCodes.OK).json({ error: false, message: "Success", property: propertyInfo })
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST)
			.json({ error: true, message: "Error in getting Property Info", err: error })
	}

}
exports.getParentPropertyInfo = async (req, res) => {
	const { propertyId } = req.params;
	try {
		let propertyInfo = await ParentProperty.findOne({ _id: propertyId })
			.populate({
				path: "subProperty",
				populate: {
					path: "owner",
					select: "email name"
				}
			})
			.populate("currentSubscription")
		return res.status(StatusCodes.OK).json({ error: false, message: "Success", property: propertyInfo })
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST)
			.json({ error: true, message: "Error in getting Property Info", err: error })
	}

}

exports.getPropertiesByHouseOwner = async (req, res) => {
	try {
		let properties = await SubProperty.find({ owner: req.user._id, isDeleted: false })
		.populate('currentSubscription')
		.populate('parentId')
		return res.status(StatusCodes.ACCEPTED).json({
			error: false,
			message: "Properties Fetched Successfully",
			properties: properties,
		})
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error fetching property ",
			error: true,
			err: error.message,
		});
	}

}


