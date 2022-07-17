const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
// jwt token
const jwt = require("jsonwebtoken");
// for hashing password
const bcrypt = require("bcryptjs");

//  Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desp  Get user
// @route GET /api/users/me
// @access PRIVATE

const getUser = asyncHandler(async (req, res) => {
  const {_id, name, email} = await User.findById(req.user.id);
  res.json({
    id: _id,
    name: name,
    email: email,
  });
});

// @desp  Post user
// @route POST /api/users
// @access PUBLIC

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  // checking if the user exits
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User Already exits");
  }

  //   hash the password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  //   create the user
  const user = await User.create({
    name,
    email,
    password: hashPassword,
  });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desp  Authenticate user
// @route POST /api/users/login
// @access PUBLIC

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //   check for the email
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});


module.exports = {
  getUser,
  registerUser,
  loginUser,
};
