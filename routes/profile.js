const express = require('express');
const { createProfile, getProfileInfo, updateProfile, getUnverifiedProfileAdmin, getUnverifiedProfileRegionalAdmin, getUnverifiedProfileAdminCount, getUnverifiedProfileRegionalAdminCount } = require('../controllers/profile');
const router = express();


router.get('/profile/:userId', getProfileInfo);

router.post('/profile/create/:userId', createProfile);

router.put('/profile/update/:userId', updateProfile);

router.get("/admin/count/unVerified/:userId", getUnverifiedProfileAdminCount)

router.get("/regional-admin/count/unVerified/:userId", getUnverifiedProfileRegionalAdminCount)

router.get("/admin/unVerified/:userId", getUnverifiedProfileAdmin)

router.get("/regional-admin/unVerified/:userId", getUnverifiedProfileRegionalAdmin)

module.exports = router;