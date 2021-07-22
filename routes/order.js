const express = require("express");
const { setUser, isSignedIn } = require("../controllers/auth");
const { generateOrders, placeOrder, historyOfOrders } = require("../controllers/order");
const router = express.Router();

router.param('userId', setUser);

router.get('/order/generate/admin', generateOrders);

router.post('/order/placeOrder/:userId', isSignedIn, placeOrder)

router.get('/order/history/:userId', isSignedIn, historyOfOrders)

module.exports = router;