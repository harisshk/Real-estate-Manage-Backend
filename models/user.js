//Import Module's
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			trim: true,
			unique: true,
		},
		avatar: {
			type: String,
			default: "https://user-images.githubusercontent.com/48409160/141422418-91ed37d8-9a74-45d3-9031-75ffb22bd050.png",
		},
		password: {
			type: String,
		},
		jwtToken: {
			type: String,
		},
		fcmToken: {
			type: String,
		},
		phoneNumber:{
			type: String,
			required:true
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			default: "tenant",
		},
		regions: [],
		subscription : {
			type : mongoose.SchemaTypes.ObjectId,
			ref : "Subscription"
		},
		/**
		 * @ Id of the account/contact created in payment API
		 */
		payoutsContactId:{
			type:String,
			
		},
		/**
		 * @ Id of the fund account created in payment API
		 */
		payoutsFundAccountId:{
			type:String,
			
		}
	},
	{timestamps: true},
);

userSchema.pre("save", function (next) {
	const user = this;
	if (user.password) {
		// Hashing the Password .
		bcrypt.hash(user.password, 10, function (err, hash) {
			if (err) {
				return res.status(400).json({
					error: true,
					message: `Error in creating the Account`,
				});
			}
			user.password = hash;
			next();
		});
	} else next();
});

// Export the Schema with the name User.
module.exports = mongoose.model("User", userSchema);
