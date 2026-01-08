const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const ExpressError = require("../utils/ExpressError");
const asyncErrorHandler = require("../utils/wrapAsync");

// Register user
const registerUser = asyncErrorHandler(async (req, res, next) => {
  console.log("file", req.file);
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ExpressError(400, "All fields are required."));
  }

  const user = await User.findOne({ email });
  if (user) {
    return next(
      new ExpressError(400, "A user with given Email already exists.")
    );
  }

  bcrypt.hash(password, 10, function (err, hash) {
    saveUser(hash);
  });

  const saveUser = async (hashedPassword) => {
    password = hashedPassword;
    const newUser = new User({ name, email, password, pic: req.file.path });
    const user = await newUser.save();

    if (user) {
      let token = generateToken(user._id);
      res.status(200).json({ user, token });
    } else {
      return next(new ExpressError(400, "Failed to create User."));
    }
  };
});

// Get Logged In user Info
const getLoggedInUser = asyncErrorHandler(async (req, res, next) => {
  let user = req.user;
  res.status(200).json({ user });
});

// Login user
const loginUser = asyncErrorHandler(async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return next(new ExpressError(400, "Email and password is required."));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ExpressError(404, "Email or password is incorrect"));
  } else {
    const hash = user.password;
    bcrypt.compare(password, hash, function (err, result) {
      isUserExists(result);
    });
  }

  const isUserExists = (result) => {
    if (result == true) {
      req.user = user;
      let token = generateToken(user._id);
      res.status(200).json({ user, token });
      console.log("Successfully logged in");
    } else {
      return next(new ExpressError(400, "Email or password is incorrect."));
    }
  };
});


// All users
const allUsers = asyncErrorHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find({
    ...keyword,
    _id: { $ne: req.user._id },   // exclude current logged-in user
  });

  res.send(users);
});


const updatePassword = asyncErrorHandler(async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return next(
        new ExpressError(400, "Current and new password are required.")
      );
    }

    // 1. Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new ExpressError(404, "User not found."));
    }

    // 2. Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new ExpressError(400, "Current password is incorrect."));
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });

  } catch (error) {
    console.error("Password update error:", error);
    return next(new ExpressError(500, "Internal server error."));
  }
});

module.exports = {
  registerUser,
  loginUser,
  allUsers,
  getLoggedInUser,
  updatePassword
};
