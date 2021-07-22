const express = require("express");
const { setUser, isAdmin, isSignedIn, isOwner, isRegionalAdmin} = require("../controllers/auth");
const { generateOrders, placeOrder, historyOfOrdersTenant, historyOfOrdersRegionalAdmin, historyOfOrdersOwner } = require("../controllers/order");
const router = express.Router();

router.param('userId', setUser);

router.get('/order/generate/admin', generateOrders);

router.post('/order/placeOrder/:userId', isSignedIn, placeOrder)

router.get('/order/history/tenant/:userId', isSignedIn, historyOfOrdersTenant)

router.get('/order/history/regionalAdmin/:userId',isSignedIn , isRegionalAdmin , historyOfOrdersRegionalAdmin);

router.get('/order/history/admin/:userId',isSignedIn,isAdmin);

router.get('/order/history/owner/:userId',isSignedIn , isOwner , historyOfOrdersOwner);

module.exports = router;