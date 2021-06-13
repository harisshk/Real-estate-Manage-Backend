const express = require("express");
const {
	deleteProperty,
	addProperty,
	updateProperty,
} = require("../controllers/property");
const {isSignedIn, setUser} = require("../controllers/user");
const router = express.Router();

router.param("userId", setUser);

router.post("/seller/add/property/:userId", isSignedIn, addProperty);

router.post("/seller/delete/property/:propertyId", deleteProperty);

router.post("/seller/update/property/:propertyId", updateProperty);

module.exports = router;
