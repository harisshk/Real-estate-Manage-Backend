//Import Module's
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
		},
		email: {
			type: String,
			trim: true,
			unique: true,
		},
		avatar: {
			type: String,
			default: "https://img.icons8.com/bubbles/2x/user-male.png",
		},
		password: {
			type: String,
			required: true,
		},
		jwtToken: {
			type: String,
		},
		fcmToken: {
			type: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isDelete: {
			type: Boolean,
			default: false,
		},

		role: {
			type: String,
			default: "visitor",
		},
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
