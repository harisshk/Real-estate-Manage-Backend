const express = require("express");
const { isSignedIn, setUser, isRegionalAdmin, isAdmin } = require("../controllers/auth");
const { createSupport, updateStatusSupport, getSupportList, supportDescription, getAllSupportByAdmin, getAllSupportByRegionalAdmin, addMessageSupport, getSupportByFilterAdmin, getSupportByFilterRegionalAdmin } = require("../controllers/support");
const router = express.Router();

router.param("userId", setUser);

/**
 * @description create support by tenant and owner
 */
router.post("/support/new/:userId", isSignedIn, createSupport);

/**
 * @description update support by admin and regional admin
 */
router.put('/support/updateStatus/:userId/:supportId', isSignedIn, updateStatusSupport);
/**
 * @description update support by admin and regional admin
 */
router.put('/support/updateMessage/:userId/:supportId', isSignedIn, addMessageSupport);

/**
 * @description get support for tenant and owner (own support)
 */

router.get('/support/list/:userId', isSignedIn, getSupportList);

/**
 * @description get all support for admin
 */

router.get('/support/list/admin/:userId', isSignedIn, isAdmin, getAllSupportByAdmin);

/**
 * @description get region based support for regional admin
 */

router.get('/support/list/regionalAdmin/:userId', isSignedIn, isRegionalAdmin, getAllSupportByRegionalAdmin);

/**
 * @description get support by id
 */

router.get('/support/:userId/:supportId', isSignedIn, supportDescription);

/**
 * @description filter support by status for Admin
 */

router.post('/support/status/admin/:userId', isSignedIn, isAdmin, getSupportByFilterAdmin);

/**
 * @description filter support by status for Regional Admin
 */

router.post('/support/status/regionalAdmin/:userId', isSignedIn, isRegionalAdmin, getSupportByFilterRegionalAdmin);

module.exports = router;