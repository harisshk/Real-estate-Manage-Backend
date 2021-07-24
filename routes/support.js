const express = require("express");
const { isSignedIn } = require("../controllers/auth");
const router = express.Router();

router.post("/support/new/:userId",isSignedIn , createNewSupport);

router.put('/support/add/:userId/:supportId',isSignedIn,updateSupport);

module.exports = router;