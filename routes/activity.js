const express = require("express");
const { setUser, isAdmin, isSignedIn, isOwner, isRegionalAdmin} = require("../controllers/auth");
const {getUserActivities} = require('../controllers/activity');
const router = express.Router();

router.param('userId', setUser);

router.get('/activity/user/logs',getUserActivities);


module.exports = router;