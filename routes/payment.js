const express = require("express");
const {getOrders, captureAmount} = require('../controllers/payment')
const router = express.Router();

router.get("/payment/order/:amount",getOrders)
router.post ("/payment/capture/:paymentId",captureAmount)

module.exports = router;
