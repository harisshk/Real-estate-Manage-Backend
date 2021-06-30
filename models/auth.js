//Import Module's
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
	{
		otp: {
			type: String,
			required: true,
		},
		user: {
			type: String,
			unique: true,
		},
	},
	{timestamps: true},
);
// Export the Schema with the name User.
module.exports = mongoose.model("OTPAuth", otpSchema);
