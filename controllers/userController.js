import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';

// Update a user

export async function updateSingleUserData(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No Booking Data found!', 404));
    }
    const { name, email } = req.body;

    user.name = name;
    user.email = email;

    const updatedUser = await user.save();

    res.status(200).json({
      status: 'success',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Get a user
export async function getSingleUserData(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No User Data found!', 404));
    }
    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Delete a user

export const deleteSingleUserData = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return next(new AppError('No Users Data found!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'User successfully deleted',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// Create a multi user  function for testing purposes

export const createAllUserData = async (req, res, next) => {
  try {
    const user = await User.insertMany(req.body);
    if (!user) {
      return next(new AppError('No Users Data has been Added!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Users successfully created',
      allBooking: user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// This function is used to get a list of users on the server

export const getAllUsersData = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// This funntion is used to delete all users data form the database

export const deleteAllUserData = async (req, res, next) => {
  try {
    console.log('Deleting all users...');
    const deletedAllUser = await User.deleteMany();
    console.log('Deleted all users:', deletedAllUser);
    if (!deletedAllUser) {
      return next(new AppError('No Users Data has been Deleted!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Users successfully deleted',
      allBooking: deletedAllUser,
    });
  } catch (error) {
    console.error('Error deleting all users:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
