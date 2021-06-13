const express = require("express");
const router = express.Router();

//Import Controller's
const {
	register,
	login,
	logout,
	updateNewPassword,
	getOTPforPassword,
	updateNewPasswordViaOTP,
	verifyAccount,
} = require("../controllers/user");

// @type POST
// @route /auth/:createAccount
// @desc Creating new Account
// @access PUBLIC
router.post("/user/register", register);

router.post("/user/verifyAccount", verifyAccount);

// @type POST
// @route /auth/login
// @desc Logging in
// @access PUBLIC
router.post("/user/login", login);

// @type GET
// @route /auth/logout
// @desc Logging out
// @access PUBLIC
router.get("/user/logout", logout);

// @type POST
// @route /update/newPassword
// @desc Update new Password
// @access PUBLIC
router.post("/update/newPassword", updateNewPassword);

// @type POST
// @route /forgot/password
// @desc Send OTP
// @access PUBLIC
router.post("/forgot/password", getOTPforPassword);

// @type POST
// @route /update/newPassword/viaOTP
// @desc Update password after verifying OTP
// @access PUBLIC
router.post("/update/newPassword/viaOTP", updateNewPasswordViaOTP);

module.exports = router;
