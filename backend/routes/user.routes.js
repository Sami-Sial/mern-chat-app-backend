const express = require("express");
const router = express.Router();

const multer = require("multer");
const { storage } = require("../cloudinary.config");
const upload = multer({ storage });
const { isLoggedIn } = require("../middlewares/middleware");
const {
  registerUser,
  loginUser,
  allUsers,
  logout,
} = require("../controllers/user.controllers");

router.post("/signup", upload.single("pic"), registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/all-users", isLoggedIn, allUsers);

module.exports = router;
