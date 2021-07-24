//Import Module's
const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
	{	
		tenant: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "User",
		},
		messages: [
            {
                user : {
                    type : mongoose.SchemaTypes.ObjectId ,
                    ref : "User",
                },
                message : {
                    type: String,
                    default : '',
                }
            }
        ],
        region : {
            type : String,
            default : "",
        },   
		status : {
            type : String ,
            default : "",
        },

	},
	{timestamps: true},
);

// Export the Schema with the name User.
module.exports = mongoose.model("Support", supportSchema);
