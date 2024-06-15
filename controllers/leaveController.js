import Employee from '../models/employeeModel.js';
import Leave from '../models/leaveModel.js';

// Create leave by ID
export const createLeave = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    if (!employeeId) {
      return res.status(404).json({
        success: false,
        message: 'Employee id not found',
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if leave is already taken on present Day
    const existingLeave = await Leave.findOne({
      employeeId: employeeId,
      createdAt: currentDate,
    });

    if (existingLeave) {
      return res.status(400).json({
        success: false,
        message: 'Leave already taken on present Day',
      });
    }

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    // Check if there are any existing leaves for the specified date range
    const overlappingLeaves = await Leave.findOne({
      employeeId: employeeId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (overlappingLeaves) {
      return res.status(400).json({
        success: false,
        message: 'Leave already taken for the specified date range',
      });
    }

    const daysTaken = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // Calculate days taken

    const newLeaveBalance = employee.leavesDetails.leaveBalance - daysTaken;

    console.log(newLeaveBalance);

    if (newLeaveBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient leave balance',
      });
    }

    const newLeave = new Leave({
      employeeId: employeeId,
      createdAt: currentDate,
      leaveType: req.body.leaveType,
      startDate: startDate,
      endDate: endDate,
      status: req.body.status,
      reason: req.body.reason,
      leaveBalance: newLeaveBalance,
    });

    await newLeave.save();
    console.log('Leave Created:', newLeave);

    // Update the leave balance in the existing Employee document
    employee.leavesDetails.leaveBalance = newLeaveBalance;
    await employee.save();

    res.status(201).json({
      status: true,
      message: 'Leave created successfully',
      newLeave,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error,
    });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { startYear, startMonth, startDay, endYear, endMonth, endDay } =
      req.query;

    if (
      !startYear ||
      !startMonth ||
      !startDay ||
      !endYear ||
      !endMonth ||
      !endDay
    ) {
      return res
        .status(400)
        .json({ message: 'Start and end year/month/day are required' });
    }

    const startDate = new Date(`${startYear}-${startMonth}-${startDay}`);
    const endDate = new Date(`${endYear}-${endMonth}-${endDay}`);

    const leaveData = await Leave.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          createdAt: { $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      {
        $unwind: '$employee',
      },
      {
        $project: {
          _id: '$_id',
          employeeId: '$employee.officialDetails.employeeId', // Retrieve specific employeeId field
          id: '$employee._id',
          candidateName: '$employee.personalDetails.candidateName',
          officialDetails: '$employee.officialDetails',
          startDate: 1,
          endDate: 1,
          leaveType: 1,
          createdAt: 1,
          status: 1,
          reason: 1,
          leaveBalance: 1,
          duration: {
            $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000],
          },
          sickLeave: {
            $cond: {
              if: { $eq: ['$leaveType', 'sick-leave'] },
              then: {
                $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000],
              },
              else: 0,
            },
          },
          casualLeave: {
            $cond: {
              if: { $eq: ['$leaveType', 'casual-leave'] },
              then: {
                $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000],
              },
              else: 0,
            },
          },
          earnedLeave: {
            $cond: {
              if: { $eq: ['$leaveType', 'earned-leave'] },
              then: {
                $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000],
              },
              else: 0,
            },
          },
          vacation: {
            $cond: {
              if: { $eq: ['$leaveType', 'vacation'] },
              then: {
                $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000],
              },
              else: 0,
            },
          },
        },
      },
    ]);

    res.status(200).json({
      status: true,
      results: leaveData.length,
      leave: leaveData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get leave by ID
export const getLeaveByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    if (!employeeId) {
      return res.status(404).json({
        success: false,
        message: 'Employee id not found',
      });
    }
    const leave = await Leave.find({
      employeeId: employeeId,
    }).populate({
      path: 'employeeId',
      select: 'candidateName employeeId jobDetails',
    });
    if (!leave) {
      return res.status(404).json({
        error: 'Leave not found',
      });
    }
    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Delete leave by ID
export const deleteLeaveById = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    if (!employeeId) {
      return res.status(404).json({
        success: false,
        message: 'Employee id not found',
      });
    }

    const leave = await Leave.findOneAndDelete({
      employeeId: employeeId,
    });

    if (!leave) {
      return res.status(404).json({
        error: 'Leave not found',
      });
    }

    // Manually update the employee's leave balance after successful deletion
    const daysTaken = leave.duration;

    const employee = await Employee.findById(employeeId);

    if (employee) {
      // Adjust leave balance based on the original leave type and duration
      if (leave.leaveType === 'sick-leave') {
        employee.leaveBalance += daysTaken;
      } else if (leave.leaveType === 'vacation') {
        // Adjust this according to your leave balance calculation logic
        employee.leaveBalance += daysTaken;
      } else if (leave.leaveType === 'personal-leave') {
        // Adjust this according to your leave balance calculation logic
        employee.leaveBalance += daysTaken;
      }

      // Reset the leave balance to the default value if needed
      employee.leaveBalance = 10; // Set to your default value

      // Save the updated employee leave balance
      await employee.save();
    }

    res.status(200).json({
      success: true,
      message: 'Leave was successfully deleted',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllLeavesWithType = async (req, res) => {
  try {
    const leaveType = req.query.leaveType;
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found',
      });
    }

    const leave = await Leave.find({
      leaveType: leaveType,
    }).populate({
      path: 'employeeId',
      select: 'candidateName employeeId',
    });

    res.status(200).json({
      success: true,
      result: leave.length,
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
