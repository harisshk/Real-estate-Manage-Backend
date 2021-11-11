const mongoose = require("mongoose");

const activitiesSchema = new mongoose.Schema(
	{
		user: {
			type : mongoose.SchemaTypes.ObjectId,
            ref : "User",
		},
		updatedBy: {
			type : mongoose.SchemaTypes.ObjectId,
            ref : "User",
		},
		type:{
			type:String,
			required:true
		},
        message:{
            type: String,
            required:true
        },
		region:{
			type: String,
            // required:true
		},
		type: {
			type: Array,
			default: []
		}
	},
	{timestamps: true},
);

// Export the Schema with the name User.
module.exports = mongoose.model("Activities", activitiesSchema);
