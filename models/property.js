//Import Module's
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		photos: [],
		rent: {
			type: Number,
			required: true,
		},
		initialDeposite: {
			type: Number,
			required: true,
		},
		shortNote: {
			type: String,
			required: true,
			trim: true,
		},
		description: {type: String, trim: true, required: true},
		isVerified: {type: Boolean, default: false},
		verifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
		documents: [],
		amenities: [],
		housePolicy: {type: String, required: true, trim: true},
		isActive: {
			type: Boolean,
			default: true,
		},
		isDelete: {
			type: Boolean,
			default: false,
		},
	},
	{timestamps: true},
);

// Export the Schema with the name User.
module.exports = mongoose.model("Property", propertySchema);
