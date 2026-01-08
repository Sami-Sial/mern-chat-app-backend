const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/middleware");
const {
  sendMessage,
  allMessages,
} = require("../controllers/message.controllers");
const multer = require("multer");
const { storage } = require("../cloudinary.config");
const upload = multer({ storage });

router.post("/", isLoggedIn, upload.single("selcetedFile"), sendMessage);
router.get("/:chatId", isLoggedIn, allMessages);

module.exports = router;
