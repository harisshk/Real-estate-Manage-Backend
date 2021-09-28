const express = require("express");
const { isAdmin, isSignedIn, setUser, isRegionalAdmin } = require("../controllers/auth");
const { newSubscription, updateSubscription, reassignSubscription, removeSubscription, getSubscriptionByTenantId } = require("../controllers/subscription");
const router = express.Router();

router.param('userId' , setUser);

router.post('/subscription/add/admin/property/:userId', isSignedIn, isAdmin , newSubscription) ;

router.post('/subscription/update/admin/property/:userId/:subscriptionId',isSignedIn ,isAdmin , updateSubscription );

router.put('/subscription/reassign/admin/:userId',isSignedIn, isAdmin, reassignSubscription);

router.delete('/subscription/remove/admin/:userId/:propertyId',isSignedIn, isAdmin, removeSubscription);

router.put('/subscription/reassign/regional-admin/:userId',isSignedIn, isRegionalAdmin, reassignSubscription);

router.delete('/subscription/remove/regional-admin/:userId/:propertyId',isSignedIn, isRegionalAdmin, removeSubscription);

router.post('/subscription/add/regionalAdmin/property/:userId',isSignedIn ,isRegionalAdmin , newSubscription );

router.post('/subscription/update/regionalAdmin/property/:userId/:subscriptionId',isSignedIn ,isRegionalAdmin , updateSubscription );

router.get('/subscription/tenant/:id', getSubscriptionByTenantId );


module.exports = router ;