const { StatusCodes } = require("http-status-codes");
const { sendMail } = require("../methods/nodemailer");
const Property = require("../models/property");
const User = require("../models/user");

exports.addProperty = async (req, res) => {
	try {
		let user = await User.findOne({ email: req.body.owner });
		if (!user) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				error: true,
				message: "Owner email not found , create account with email ID first",

			})
		}
		req.body.owner = user._id;
		let newProperty = await new Property(req.body).save();
		let body = `<p>New Property Added</p>
		<p>${newProperty.name}&nbsp;</p>
		<p style="text-align: center;"><img src=${newProperty?.photos[0]} alt="" width="421" height="280" /></p>
		<p>Property Location</p>
		<p>&nbsp; &nbsp;${newProperty?.addressLine1},</p>
		<p>&nbsp; &nbsp;${newProperty?.addressLine2 || ''}</p>
		<p>&nbsp; &nbsp;${newProperty?.zipCode}, ${newProperty?.region}.</p>
		<p>&nbsp; &nbsp;${newProperty?.state}</p>
		<p>Rent: ${newProperty.rent} Rs</p>
		<p>Initial Deposit: ${newProperty.initialDeposit} Rs</p>
		<p>Square Feet: ${newProperty.size} ft</p>
		<p>Added By ${req.user.name}-(${req?.user?.regions[0]})</p>
		<p>&nbsp;&nbsp;</p>`;
        let subject = `!! PROPY New Property Added`;
        let allAdmins = await User.find({role : "admin" , isActive : true});
        for(let i = 0 ; i < allAdmins.length ; i++){
            sendMail (allAdmins[i].email, subject ,body);
        }
		return res.status(StatusCodes.ACCEPTED).json({
			message: "Property added",
			error: false,
			property: newProperty,
		});
	} catch (error) {
		console.log(error)
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error in adding the property ",
			error: true,
			err: error.message,
		});
	}
};

exports.updateProperty = (req, res) => {
	Property.findByIdAndUpdate({ _id: req.params.propertyId }, { $set: req.body },{new:1})
		.then(async(updatedProperty) => {
		let body = `<p>Property Updated</p>
		<p>${updatedProperty.name}&nbsp;</p>
		<p style="text-align: center;"><img src=${updatedProperty?.photos[0]} alt="" width="421" height="280" /></p>
		<p>Property Location</p>
		<p>&nbsp; &nbsp;${updatedProperty?.addressLine1},</p>
		<p>&nbsp; &nbsp;${updatedProperty?.addressLine2 || ''}</p>
		<p>&nbsp; &nbsp;${updatedProperty?.zipCode}, ${updatedProperty?.region}.</p>
		<p>&nbsp; &nbsp;${updatedProperty?.state}</p>
		<p>Rent: ${updatedProperty.rent} Rs</p>
		<p>Initial Deposit: ${updatedProperty.initialDeposit} Rs</p>
		<p>Square Feet: ${updatedProperty.size} ft</p>
		<p>Updated By ${req.user.name}-(${req?.user?.role})</p>
		<p>&nbsp;&nbsp;</p>`;
        let subject = `!! PROPY Property Updated`;
        let allAdmins = await User.find({role : "admin" , isActive : true});
        for(let i = 0 ; i < allAdmins.length ; i++){
            sendMail (allAdmins[i].email, subject ,body);
        }
			return res.status(StatusCodes.ACCEPTED).json({
				message: "Property updated",
				error: false,
			});
		})
		.catch((error) =>{
			console.log(error)
			res.status(StatusCodes.BAD_REQUEST).json({
				message: "Error in updating the property ",
				error: true,
				err: error,
			})
		})
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
		let properties = await Property.find({ isDeleted: false }).populate('subscription');
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
		let properties = await Property.find({ isDeleted: false, region: req.user.regions[0] }).populate('subscription').populate({ path: "subscription", populate: 'tenant' }).populate("owner", { jwtToken: 0, password: 0 });
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
		let propertyInfo = await Property.findOne({ _id: propertyId }).populate("owner")
			.populate('subscription')
		return res.status(StatusCodes.OK).json({ error: false, message: "Success", property: propertyInfo })
	} catch (error) {
		return res.status(StatusCodes.BAD_REQUEST)
			.json({ error: true, message: "Error in getting Property Info", err: error })
	}

}

exports.getPropertiesByHouseOwner = async (req, res) => {
	try {
		let properties = await Property.find({ owner: req.user._id, isDeleted: false }).populate('subscription');
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