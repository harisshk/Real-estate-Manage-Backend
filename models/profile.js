//Import Module's
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
	{
		isVerified : {type : Boolean,default : false},
		user: {type: mongoose.SchemaTypes.ObjectId, ref: "User"},
		idProof : {type : String , default : ''},
		phoneNumber: {type : String , default : ''},
		ifsc : {type : String , default : ''},
		accountHolderName :{type : String , default : ''},
		accountNumber : {type : String , default : ''},
		documents : [{
			url : 
			{type : String} ,
			docType :{type : String},
			verified : {
				type : Boolean,
				defualt : false,
			},
		}],
		isActive: {
			type: Boolean,
			default: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{timestamps: true},
);
// Export the Schema with the name User.
module.exports = mongoose.model("Profile", profileSchema);
