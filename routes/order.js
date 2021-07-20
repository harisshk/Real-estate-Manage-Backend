const express = require("express");
const { setUser, isSignedIn } = require("../controllers/auth");
const { generateOrders,placeOrder } = require("../controllers/order");
const router = express.Router();

router.param('userId' , setUser);

router.get('/order/generate/admin' , generateOrders) ;

router.post('/order/placeOrder/:userId',isSignedIn,placeOrder)


module.exports = router ;