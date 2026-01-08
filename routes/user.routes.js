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
  getLoggedInUser,
  updatePassword
} = require("../controllers/user.controllers");

router.post("/signup", upload.single("pic"), registerUser);
router.post("/login", loginUser);
router.get("/all-users", isLoggedIn, allUsers);
router.get("/me", isLoggedIn, getLoggedInUser);
router.put("/update-password", isLoggedIn, updatePassword);

module.exports = router;
