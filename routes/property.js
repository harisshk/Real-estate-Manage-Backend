const express = require("express");
const {
	deleteProperty,
	addProperty,
	updateProperty,
	getProperties,
	approveProperty,
	disApproveProperty,
} = require("../controllers/property");
const {isSignedIn, setUser, isOwner, isAdmin} = require("../controllers/auth");
const router = express.Router();

router.param("userId", setUser);

// router.post("/owner/add/property/:userId", isSignedIn, isOwner, addProperty);

router.post("/admin/add/property/:userId", isSignedIn, isAdmin, addProperty);

router.post(
	"/owner/delete/property/:propertyId/:userId",
	isSignedIn,
	isOwner,
	deleteProperty,
);

router.post(
	"/owner/update/property/:propertyId/:userId",
	isSignedIn,
	isOwner,
	updateProperty,
);

router.get("/view/properties/:isVerified/:userId", isSignedIn, getProperties);

router.post(
	"/admin/approve/property/:propertyId/:userId",
	isSignedIn,
	isAdmin,
	approveProperty,
);

router.post(
	"/admin/disapprove/property/:propertyId/:userId",
	isSignedIn,
	isAdmin,
	disApproveProperty,
);

module.exports = router;
