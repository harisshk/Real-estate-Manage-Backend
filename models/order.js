//Import Module's
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		subscription: {
			type:mongoose.SchemaTypes.ObjectId,
			ref: "Subscription",
		},
        user : {
            type : mongoose.SchemaTypes.ObjectId,
            ref : "User",
        },		
		amount: {
			type : Number ,
			required : true ,
		},
        transactionId : {
            type : mongoose.SchemaTypes.ObjectId,
            ref : "Transaction",
        },
		orderMessage : {
			type : String ,
			default : "Rent"
		},
        paymentStatus: {
            type : String ,
            default : 'Pending' 
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
module.exports = mongoose.model("Order", orderSchema);
