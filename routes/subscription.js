const express = require("express");
const { isAdmin, isSignedIn, setUser } = require("../controllers/auth");
const { newSubscription, updateSubscription } = require("../controllers/subscription");
const router = express.Router();

router.param('userId' , setUser);

router.post('/subscription/add/admin/property/:userId', isSignedIn, isAdmin , newSubscription) ;

router.post('/subscription/update/admin/property/:userId/:subscriptionId',isSignedIn ,isAdmin , updateSubscription );


module.exports = router ;