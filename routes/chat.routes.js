const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/middleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chat.controllers");
const multer = require("multer");
const { storage } = require("../cloudinary.config");
const upload = multer({ storage });

router.post("/", isLoggedIn, accessChat);
router.get("/", isLoggedIn, fetchChats);
router.post("/group", isLoggedIn, upload.single("groupPic"), createGroupChat);
router.put("/group/rename", isLoggedIn, renameGroup);
router.put("/group/add_user", isLoggedIn, addToGroup);
router.put("/group/remove_user", isLoggedIn, removeFromGroup);

module.exports = router;
