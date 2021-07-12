//Import Module's
const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
	{
		property: {type: mongoose.SchemaTypes.ObjectId, ref: "Property"},
		users : [{type : mongoose.SchemaType.ObjectId , ref : "User"}], 
		currUser: {
			type:User,
			ref: "User",
		},
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
module.exports = mongoose.model("Tenant", tenantSchema);
