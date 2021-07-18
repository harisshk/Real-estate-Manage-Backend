const {StatusCodes} = require("http-status-codes");
const Property = require("../models/property");
const User = require("../models/user");

exports.addProperty = async (req, res) => {
	try {
		let user = await User.findOne({email : req.body.owner}) ;
		if(!user){
			return res.status(StatusCodes.BAD_REQUEST).json({
				error : true ,
				message : "Owner email not found , create account with email ID first" ,

			})
		}
		req.body.owner = user._id ;
			let newProperty = await new Property(req.body).save();

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

		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({error: false, properties: results});
	} catch (error) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({error: true, message: error.message});
	}
};

exports.getPropertiesByAdmin = async(req,res)=>{
	try{
		let properties = await Property.find({isDeleted : false}).populate('subscription').populate({path : "subscription" , populate :'tenant'}).populate("owner",{jwtToken:0,password:0})
			return res.status(StatusCodes.ACCEPTED).json({
			error : false ,
			message : "Properties Fetched Successfully",
			properties : properties ,
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

exports.getPropertiesByRegionalAdmin = async(req,res)=>{
	try{
		let properties = await Property.find({isDeleted : false , region : req.user.regions[0] }).populate('subscription').populate({path : "subscription" , populate :'tenant'}).populate("owner",{jwtToken:0,password:0}) ;
		return res.status(StatusCodes.ACCEPTED).json({
			error : false ,
			message : "Properties Fetched Successfully",
			properties : properties ,
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

exports.getPropetyById = async(req,res) => {
	const {propertyId} = req.params ;
	try{

		let propertyInfo = await Property.findOne({_id : propertyId}).populate('subscription').populate({path : "subscription" , populate :'tenant'}).populate('createdBy').populate('owner')
		return res.status(400).json({error : false , message : "Success" , property : propertyInfo})
	}catch(error){return res.status(StatusCodes.BAD_REQUEST).json({error : true ,message : "Error in getting Property Info",err : error})}

}

exports.getPropertiesByHouseOwner = async(req,res) => {
	try{
		let properties = await Property.find({owner : req.user._id , isDeleted : false} ).populate('subscription').populate({path : "subscription" , populate :'tenant'}) ;
		return res.status(StatusCodes.ACCEPTED).json({
			error : false ,
			message : "Properties Fetched Successfully",
			properties : properties ,
		})
	}catch(error){
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Error fetching property ",
			error: true,
			err: error.message,
		});
	}
	
}