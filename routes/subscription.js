const express = require("express");
const { isAdmin, isSignedIn, setUser, isRegionalAdmin } = require("../controllers/auth");
const { newSubscription, updateSubscription } = require("../controllers/subscription");
const router = express.Router();

router.param('userId' , setUser);

router.post('/subscription/add/admin/property/:userId', isSignedIn, isAdmin , newSubscription) ;

router.post('/subscription/update/admin/property/:userId/:subscriptionId',isSignedIn ,isAdmin , updateSubscription );

router.post('/subscription/update/regionalAdmin/property/:userId/:subscriptionId',isSignedIn ,isRegionalAdmin , updateSubscription );


module.exports = router ;