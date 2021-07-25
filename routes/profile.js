const express = require('express');
const { setUser, isSignedIn, isAdmin, isRegionalAdmin } = require('../controllers/auth');
const { createProfile, getProfileInfo, updateProfile, getUnverifiedProfileAdmin, getUnverifiedProfileRegionalAdmin, getUnverifiedProfileAdminCount, getUnverifiedProfileRegionalAdminCount } = require('../controllers/profile');
const router = express();

router.param('userId' , setUser);

router.get('/profile/:userId', getProfileInfo);

router.post('/profile/create/:userId', isSignedIn, createProfile);

router.put('/profile/update/:userId', isSignedIn, updateProfile);

router.get("/profile/admin/count/unVerified/:userId", isSignedIn , isAdmin , getUnverifiedProfileAdminCount)

router.get("/profile/regionalAdmin/count/unVerified/:userId", isSignedIn , isRegionalAdmin , getUnverifiedProfileRegionalAdminCount)
 
router.get("/profile/admin/unVerified/:userId", isSignedIn , isAdmin, getUnverifiedProfileAdmin)

router.get("/profile/regionalAdmin/unVerified/:userId",isSignedIn , isRegionalAdmin, getUnverifiedProfileRegionalAdmin)

module.exports = router;