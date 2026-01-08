const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ExpressError = require("../utils/ExpressError");

const isLoggedIn = async (req, res, next) => {
  let token;
  if (
    req.headers?.authorization?.startsWith("Bearer") &&
    req.headers?.authorization?.length > 11
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(new ExpressError(401, "Please Login to access this Resource"));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    console.log(error.message, error.name);

    return next(new ExpressError(401, error));
  }
};

const fieldsChecking = async (req, res, next) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ExpressError(400, "All fields are required."));
  }

  const user = await User.findOne({ email });
  if (user !== "") {
    return next(
      new ExpressError(400, "A user with given Email already exists.")
    );
  }

  next();
};

module.exports = {
  isLoggedIn,
  fieldsChecking,
};
