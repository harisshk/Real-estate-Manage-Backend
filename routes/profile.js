const express = require('express');
const { createProfile, getProfileInfo ,updateProfile} = require('../controllers/profile');
const router = express();


router.get('/profile/:userId',getProfileInfo);

router.post('/profile/create/:userId',createProfile);

router.put('/profile/update/:userId',updateProfile);

module.exports = router;