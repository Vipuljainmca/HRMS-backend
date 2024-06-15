import WorkingHours from '../models/workingHoursModel.js';

// Function to handle user login
export const loggedIn = async (req, res) => {
  try {
    const loggedInTime = new Date();
    const workingHoursEntry = new WorkingHours({ loggedInTime });
    await workingHoursEntry.save();

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: workingHoursEntry,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// Function to handle user logout
export const loggedOut = async (req, res) => {
  try {
    const loggedOutTime = new Date();
    // Find the last working hours entry and update the loggedOutTime
    const lastEntry = await WorkingHours.findOne().sort({ _id: -1 });
    if (lastEntry) {
      lastEntry.loggedOutTime = loggedOutTime;
      await lastEntry.save();

      res.status(200).json({
        status: 'success',
        message: 'logged out successfully',
        data: lastEntry,
      });
    } else {
      res.status(404).json({
        status: 'error',
        error: 'Not found',
        message: 'No active session found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      message: error.message,
    });
  }
};

export const getWorkingHours = async (req, res) => {
  try {
    // Retrieve all working hours records
    const allWorkingHours = await WorkingHours.find();

    res.status(200).json({
      status: 'success',
      results: allWorkingHours.length,
      data: allWorkingHours,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      message: error.message,
    });
  }
};
