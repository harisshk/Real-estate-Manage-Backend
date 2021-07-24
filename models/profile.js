//Import Module's
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
	{
		user: {type: mongoose.SchemaTypes.ObjectId, ref: "User"},
		phoneNumber: {type : String , default : ''},
		bank :{
			ifsc : {type : String , default : ''},
			accountHolderName :{type : String , default : ''},
			accountNumber : {type : String , default : ''},
			bankName : {type : String , default : ''}
		},
		region:{type : String , default: ""},
		documents : [{
			idProof : {type : String , default : ''},
			url : {type : String} ,
			docType :{type : String},
		}],
		isVerified : {type : Boolean,default : false},
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
