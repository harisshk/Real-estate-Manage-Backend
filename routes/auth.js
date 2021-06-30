const express = require("express");
const { generateOTP, validateOTP } = require("../controllers/auth");
const router = express.Router();

router.post("/login/otp",generateOTP)

router.post("/login/validate",validateOTP)
module.exports = router;
