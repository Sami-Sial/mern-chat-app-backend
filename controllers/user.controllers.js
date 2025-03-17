const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const ExpressError = require("../utils/ExpressError");
const asyncErrorHandler = require("../utils/wrapAsync");

// Register user
const registerUser = asyncErrorHandler(async (req, res, next) => {
  console.log(req.file);
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
    const user = new User({ name, email, password });
    const savedUser = await user.save();

    if (user) {
      let token = generateToken(user._id);
      res.status(200).json({ savedUser, token });
    } else {
      return next(new ExpressError(400, "Failed to create User."));
    }
  };
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

const logout = asyncErrorHandler(async (req, res, next) => {
  // res.cookie("token", null, {
  //   expires: new Date(Date.now()),
  //   httpOnly: true,
  // });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

// All users
const allUsers = asyncErrorHandler(async (req, res) => {
  let keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  let users = await User.find(keyword);
  users = users.filter((user) => {
    return user._id !== req.user._id;
  });

  res.send(users);
});

module.exports = {
  registerUser,
  loginUser,
  allUsers,
  logout,
};
