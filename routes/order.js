const express = require("express");
const { setUser } = require("../controllers/auth");
const { generateOrders } = require("../controllers/order");
const router = express.Router();

router.param('userId' , setUser);

router.get('/order/generate/admin' , generateOrders) ;


module.exports = router ;