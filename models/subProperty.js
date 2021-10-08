//Import Module's
const mongoose = require("mongoose");

const subPropertySchema = new mongoose.Schema(
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
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        photos: [],
        rent: {
            type: Number,
            required: true,
        },
        initialDeposit: {
            type: Number,
            required: true,
        },
        size: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
        documents: [],
        amenities: [],
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        propertyType: {
            type: String,
            enum: ["House", "Hotel", "Shop"],
            default: "House"
        },
        bedRoom: {
            type: Number,
        },
        restRoom: {
            type: Number,
        },
        kitchen: {
            type: Number,
        },
        isOccupied: {
            type: Boolean,
            default: false
        },
        subscription: {
            type: Array,
            ref: "Subscription"
        },
        geoLocation: {
            latitude: '',
            longitude: ''
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ParentProperty"
        },
        floor: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

// Export the Schema with the name SubProperty.
module.exports = mongoose.model("SubProperty", subPropertySchema);
