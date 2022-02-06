//Import Module's
const mongoose = require("mongoose");

const parentPropertySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        zipCode: {
            type: String,
            required: true,
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },
        addressLine2: {
            type: String,
        },
        region: {
            type: String,
            // required: true,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        geoLocation: {
            latitude: '',
            longitude: ''
        },
        thumbnailPhoto: {
            type: String,
            required: true
        },
        noOfFloors: {
            type: Number,
            required: true
        },
        subProperty: {
            type: Array,
            default: [],
            ref: "SubProperty"
        }
    },
    { timestamps: true }
);

// Export the Schema with the name ParentProperty.
module.exports = mongoose.model("ParentProperty", parentPropertySchema);
