const express = require("express");
const router = express.Router();

//Import Controller's
const {
	register,
	login,
	logout,
	updateNewPassword,
	getOTPForPassword,
	updateNewPasswordViaOTP,
	verifyAccount,
	getAllUsersByRoles,
	updateUser,
	createAccountByAdmins,
	generateOTP,
	validateLoginOTP,
	validateForgotPasswordOTP,
	updateUserInfo,
	getSubscriptionInfo,
	getAdminDashboardInfo,
	getRegionalAdminInfo,
	getOwnerDashboardInfo,
	tenantDashboardInfo,
	getUserInfo,
	getTenantsForAssign,
	getUsersForAssignAdmin,
	getUsersForAssignRegionalAdmin,
	getTenantsForAssignAdmin
} = require("../controllers/user");

const {
	isSignedIn,
	isAdmin,
	setUser,
	isRegionalAdmin,
	isOwner,
} = require("../controllers/auth");

router.param("userId", setUser);

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
router.get("/user/logout/:userId", isSignedIn, logout);

// @type POST
// @route /update/newPassword
// @desc Update new Password
// @access PUBLIC
router.post("/user/update/newPassword", updateNewPassword);

// @type POST
// @route /forgot/password
// @desc Send OTP
// @access PUBLIC
router.post("/user/forgot/password", getOTPForPassword);

router.post(
	"/user/admin/createAccount/:userId",
	isSignedIn,
	isAdmin,
	createAccountByAdmins,
);

router.post(
	"/user/regionalAdmin/createAccount/:userId",
	isSignedIn,
	isRegionalAdmin,
	createAccountByAdmins,
);
router.post(
	"/user/houseOwner/createAccount/:userId",
	isSignedIn,
	isOwner,
	createAccountByAdmins,
);

router.post(
	"/user/getUserByRole/:userId",
	isSignedIn,
	isAdmin,
	getAllUsersByRoles,
);
router.post(
	"/user/getUserByRole/regionalAdmin/:userId",
	isSignedIn,
	isRegionalAdmin,
	getAllUsersByRoles,
);
router.post("/user/update/admin/:userId", isSignedIn, isAdmin, updateUser);
router.post("/user/update/owner/:userId", isSignedIn, isOwner, updateUser);
router.post(
	"/user/update/regionalAdmin/:userId",
	isSignedIn,
	isRegionalAdmin,
	updateUser,
);

router.post("/user/login/otp", generateOTP);

router.post("/user/login/validate", validateLoginOTP);

router.post("/user/forgotPassword/validate", validateForgotPasswordOTP);

router.post("/user/updateUserInfo/:userId", isSignedIn, updateUserInfo);

router.get('/user/subscriptionInfo/:userId',isSignedIn, getSubscriptionInfo)

router.get('/user/admin/dashboardInfo/:userId',isSignedIn,isAdmin,getAdminDashboardInfo);

router.get('/user/regionalAdmin/dashboardInfo/:userId',isSignedIn , isRegionalAdmin , getRegionalAdminInfo) ;

router.get('/user/owner/dashboardInfo/:userId',isSignedIn ,isOwner, getOwnerDashboardInfo)

router.get('/user/tenant/dashboardInfo/:userId',isSignedIn , tenantDashboardInfo);

router.get('/user/accountInfo/:userId' , getUserInfo);

router.post('/user/admin/owners/:userId',isSignedIn , isAdmin, getUsersForAssignAdmin);
router.post('/user/admin/tenant/:userId',isSignedIn , isAdmin, getUsersForAssignAdmin);
router.post('/user/regional-admin/owners/:userId',isSignedIn , isRegionalAdmin , getUsersForAssignRegionalAdmin);
router.post('/user/regional-admin/tenant/:userId',isSignedIn , isRegionalAdmin , getUsersForAssignRegionalAdmin);

module.exports = router;
