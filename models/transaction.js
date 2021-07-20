//Import Module's
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
	{
		transactionId: {
            type : Number ,
            required : true 
        },
		tenant: {
			type:mongoose.SchemaTypes.ObjectId,
			ref: "User",
		},
        property : {
            type: mongoose.SchemaTypes.ObjectId,
            ref : "Property"
        },
		isActive: {
			type: Boolean,
			default: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		amountPaid : {
			type : Number ,
			required : true 
		}
	},
	{timestamps: true},
);
// Export the Schema with the name User.
module.exports = mongoose.model("Transaction", transactionSchema);
