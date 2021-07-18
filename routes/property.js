const express = require("express");
const {
	addProperty,
	updateProperty,
	getProperties,
	getPropertiesByRegionalAdmin,
	getPropertiesByAdmin,getPropertiesByHouseOwner
	
} = require("../controllers/property");
const {isSignedIn, setUser, isOwner, isAdmin, isRegionalAdmin} = require("../controllers/auth");
const router = express.Router();

router.param("userId", setUser);

// router.post("/owner/add/property/:userId", isSignedIn, isOwner, addProperty);

router.post("/property/admin/add/:userId", isSignedIn, isAdmin, addProperty);

router.post("/property/regionalAdmin/add/:userId", isSignedIn, isRegionalAdmin, addProperty);

// router.post(
// 	"/owner/delete/property/:propertyId/:userId",
// 	isSignedIn,
// 	isOwner,
// 	deleteProperty,
// );

// router.post(
// 	"/owner/update/property/:propertyId/:userId",
// 	isSignedIn,
// 	isOwner,
// 	updateProperty,
// );

router.get("/property/view/admin/:userId",isSignedIn,isAdmin,getPropertiesByAdmin)

router.get("/property/view/regionalAdmin/:userId",isSignedIn,isRegionalAdmin,getPropertiesByRegionalAdmin)


router.get("/property/view/owner/:userId",isSignedIn,isOwner, getPropertiesByHouseOwner)


router.get("/property/view/:isVerified/:userId", isSignedIn, getProperties);

router.post(
	"/property/admin/update/:propertyId/:userId",
	isSignedIn,
	isAdmin,
	updateProperty
);
router.post(
	"/property/regionalAdmin/update/:propertyId/:userId",
	isSignedIn,
	isRegionalAdmin,
	updateProperty
);

module.exports = router;
