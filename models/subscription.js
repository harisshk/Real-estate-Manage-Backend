//Import Module's
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
	{
		property: {type: mongoose.SchemaTypes.ObjectId, ref: "SubProperty"},
		tenant: {
			type:mongoose.SchemaTypes.ObjectId,
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
		billingCycle :{
			type : Number ,
			default : 0 ,
		},
		paidUntil : {
			type : String,
			default : ''
		}
	},
	{timestamps: true},
);
// Export the Schema with the name User.
module.exports = mongoose.model("Subscription", subscriptionSchema);
