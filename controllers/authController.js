import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Calculate expiration time for the cookie
  const expiresInMilliseconds =
    process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;

  res.cookie('jwt', token, {
    expires: expiresInMilliseconds, // Set expiration date
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    if (!name || !email || !password || !passwordConfirm || !role) {
      return next(new AppError('Please provide details of users!', 400));
    }

    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      role,
    });

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    res.status(500).json({
      status: 'Internal Server Error',
      message: error.message,
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user?.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 201, req, res);
  } catch (error) {
    res.status(500).json({
      status: 'Internal Server Error',
      message: error.message,
    });
  }
};
