const express = require("express");
const { isSignedIn } = require("../controllers/auth");
const { createSupport, updateSupport ,getSupportList, supportDescription } = require("../controllers/support");
const router = express.Router();

router.post("/support/new/:userId",isSignedIn ,createSupport );

router.put('/support/add/:userId/:supportId',isSignedIn,updateSupport);

router.get('/support/list/:userId' , isSignedIn , getSupportList);

router.get('/support/:userId/:supportId',isSignedIn , supportDescription); 

module.exports = router;