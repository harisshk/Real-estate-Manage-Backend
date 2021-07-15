const express = require("express");
const { isAdmin, isSignedIn } = require("../controllers/auth");
const { assignFirstTenant, assignNewTenant } = require("../controllers/subscription");
const router = express.Router();

router.post('/subscription/add/admin/property/:userId', isSignedIn, isAdmin , assignFirstTenant) ;

router.post('/subscription/update/admin/property/:userId/:subscriptionId',isSignedIn ,isAdmin , assignNewTenant );


module.exports = router ;