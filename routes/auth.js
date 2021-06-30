const express = require("express");
const {generateOTP, validateOTP} = require("../controllers/auth");
const router = express.Router();

router.post("/auth/login/otp", generateOTP);

router.post("/auth/login/validate", validateOTP);

module.exports = router;
