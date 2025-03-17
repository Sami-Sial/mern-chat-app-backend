const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/middleware");
const { generateZegoToken } = require("../controllers/zegoToken.controllers");

router.get("/generate-token/:userId", isLoggedIn, generateZegoToken);

module.exports = router;
