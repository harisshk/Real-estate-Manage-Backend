//Import Module's
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		user: {type: mongoose.SchemaTypes.ObjectId, ref: "User"},
		fullName: {
			type: String,
			trim: true,
		},
		idProof: {
			type: String,
			trim: true,
			unique: true,
		},

		bankAccount: {
			type: String,
		},
		mobile: {
			type: String,
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
module.exports = mongoose.model("Profile", userSchema);
