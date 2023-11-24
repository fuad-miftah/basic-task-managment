import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createSuccess } from "../utils/success.js";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";


export const register = async (req, res, next) => {
  try {

    const validationError = await validateUser(req.body);
    if (validationError) {
      return res.status(validationError.status).json(validationError);
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    const savedUser = await newUser.save();

    res.status(201).json(createSuccess('User has been created.', savedUser));
  } catch (err) {
    next(err);
  }
};

const validateUser = async (userData) => {
  try {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      return createError(400, 'Email is already in use.');
    }

    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      return createError(400, 'Username is already taken.');
    }

    if (userData.password.length < 6) {
      return createError(400, 'Password must be at least 6 characters long.');
    }

    if (!emailRegex.test(userData.email)) {
      return createError(400, 'Invalid email format.');
    }

    await User.validate(userData);

    return null;
  } catch (validationError) {
    return createError(400, validationError.message);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    if (!process.env.JWT) {
      return next(createError(500, "JWT secret key is not configured."));
    }

    const access_token = jwt.sign(
      { id: user._id },
      process.env.JWT  
    );

    const { password, ...otherDetails } = user._doc;
    res
      .cookie("access_token", access_token, {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json(createSuccess("Login successful.", { details: { ...otherDetails }, access_token }));
  } catch (err) {
    next(err);
  }
};

