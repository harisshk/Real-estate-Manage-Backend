//Import Module's
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
	/**
	 * @desc Username email or phone number.
	 */
	username:{
		type:String,
	},
	type:{
		type:String,
	},
    createdAt: {
      type: Date,
      expires: "1m",
      default: Date.now,
    },
	otpType:{
		type:String,
		required:true
	}
  },
  { timestamps: true }
);

// Export the Schema with the name User.
module.exports = mongoose.model("OTP", otpSchema);
