//Import Module's
const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
    {
        supportNo: {
            type: String,
            required:true
        },
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
        },
        messages: [
            {
                user: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "User",
                },
                message: {
                    type: String,
                    default: '',
                }
            }
        ],
        subject: {
            type: String,
            default: "",
        },
        region: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            default: "",
        },
        assignedTo: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User"
        }

    },
    { timestamps: true },
);

// Export the Schema with the name User.
module.exports = mongoose.model("Support", supportSchema);
