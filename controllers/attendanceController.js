import moment from 'moment';
import puppeteer from 'puppeteer';
import Attendance from '../models/attendanceModel.js';
import Employee from '../models/employeeModel.js';
import AppError from '../utils/AppError.js';
import { findEmployeeById } from '../utils/utils.js';
import { getUniqueDepartments } from './employeeController.js';

export const generateReport = async (req, res) => {
  const browser = await puppeteer.launch();
  try {
    const { employeeId } = req.params;
    const page = await browser.newPage();

    await page.goto(
      `${req.protocol}://${req.get('host')}/api/attendance/${employeeId}`
    );

    const employee = await findEmployeeById(employeeId);

    const response = await fetch(
      `${req.protocol}://${req.get('host')}/api/attendance/${employeeId}`
    );
    const data = await response.json();
    if (!employee) {
      res.status(404).json({
        status: true,
        message: 'Employee not found',
      });
    }
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Attendance Report</title>
             <style>
          body {
              font-family: Arial, sans-serif;
              margin: 20px;
          }
  
          h1, h2 {
              color: #333;
          }
  
          table {
              border-collapse: collapse;
              width: 100%;
              margin-top: 20px;
          }
  
          th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
          }
  
          th {
              background-color: #f2f2f2;
          }
  
          p {
              margin-bottom: 10px;
          }
      </style>
          </head>
          <body>
            <h1>Attendance Report</h1>
  
            <p>Employee ID: ${employee.employeeId}</p>
            <p>Candidate Name: ${employee.candidateName}</p>
            <p>Designation: ${employee.jobDetails.designation}</p>
            <p>Department: ${employee.jobDetails.department}</p>
            <p>Role: ${employee.jobDetails.role}</p>
            <!-- Add more employee details as needed -->
  
            <!-- Display attendance records -->
            <h2>Attendance Records:</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Login Time</th>
                <th>Logout Time</th>
              </tr>
              ${data.data
                .map(
                  (record) => `
                <tr>
                  <td>${moment(record.formattedDate).format('DD-MM-YYYY')}</td>
                  <td>${record.status.toUpperCase()}</td>
                  <td>${record.formattedLoginTime}</td>
                  <td>${record.formattedLogoutTime}</td>
                </tr>
              `
                )
                .join('')}
            </table>
          </body>
        </html>
      `;

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm',
      },
    });

    // Set response headers to trigger download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance_report_${employee?.candidateName}_${employee?.jobDetails?.designation}(${employee?.employeeId}).pdf`
    );

    // Send the PDF buffer as the response
    res.status(200).send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      status: 'Internal Server Error!',
      error: error.message,
    });
  } finally {
    await browser.close();
  }
};

// Get Single Employee Attendance data Using EmployeeId

export const getAttendanceByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;

    const employee = await findEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const attendanceRecords = await Attendance.find({
      employeeId: employeeId,
    }).populate('employeeId');

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance records not found for the given employeeId',
      });
    }

    const statusCounts = {
      present: 0,
      absent: 0,
      halfday: 0,
      workFromHome: 0,
      sickLeave: 0,
      paidLeave: 0,
      earnedLeave: 0,
      holiday: 0,
    };

    attendanceRecords.forEach((record) => {
      const status = record.status;
      statusCounts[status] += 1;
    });

    // Filter out only the records where the employeeId matches
    const filteredRecords = attendanceRecords.filter(
      (record) => record.employeeId !== null
    );

    res.status(200).json({
      success: true,
      results: filteredRecords.length,
      data: filteredRecords,
      statusCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Single Employee Attendance data for the specified Date Range

export const getSingleEmployeeAttendanceWithDate = async (req, res) => {
  try {
    const {
      employeeId,
      startMonth,
      startYear,
      startDay,
      endMonth,
      endYear,
      endDay,
    } = req.query;

    if (
      !employeeId ||
      !startYear ||
      !startMonth ||
      !startDay ||
      !endYear ||
      !endMonth ||
      !endDay
    ) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Calculate the start and end dates for the selected month and year
    const startDate = moment(
      `${startYear}-${startMonth}-${startDay}`,
      'YYYY-MM-DD'
    ).toDate();
    const endDate = moment(
      `${endYear}-${endMonth}-${endDay}`,
      'YYYY-MM-DD'
    ).toDate();
    // Find attendance records for the specified month, year, and employeeId
    const attendanceData = await Attendance.find({
      employeeId: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).populate('employeeId');

    if (!attendanceData || attendanceData.length === 0) {
      return res.status(404).json({
        message:
          'No attendance records found for the specified month, year, and employeeId',
      });
    }

    const statusCounts = {
      present: 0,
      absent: 0,
      halfday: 0,
      workFromHome: 0,
      sickLeave: 0,
      paidLeave: 0,
      earnedLeave: 0,
      holiday: 0,
    };

    attendanceData.forEach((record) => {
      const status = record.status;
      statusCounts[status] += 1;
    });

    res.status(200).json({
      success: true,
      results: attendanceData.length,
      attendanceData,
      statusCounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance data' });
  }
};

export const getAllEmployeesAttendanceWithDate = async (req, res) => {
  try {
    const { startMonth, startYear, startDay, endMonth, endYear, endDay } =
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

    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
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
        $addFields: {
          duration: { $subtract: ['$loggedOutTime', '$loggedInTime'] },
        },
      },
      {
        $addFields: {
          durationInSeconds: { $divide: ['$duration', 1000] }, // Convert duration to seconds
          durationInMinutes: { $divide: ['$duration', 60000] }, // Convert duration to minutes
          durationInHours: { $divide: ['$duration', 3600000] }, // Convert duration to hours
        },
      },
      {
        $group: {
          _id: {
            employeeId: '$employee._id',
            candidateName: '$employee.personalDetails.candidateName',
            officialDetails: '$employee.officialDetails',
            employee: '$employee',
          },
          attendance: {
            $push: {
              _id: '$_id',
              date: '$date',
              status: '$status',
              loggedInTime: '$loggedInTime',
              loggedOutTime: '$loggedOutTime',
              duration: '$duration',
              durationInSeconds: '$durationInSeconds',
              durationInMinutes: '$durationInMinutes',
              durationInHours: '$durationInHours',
            },
          },
        },
      },
      {
        $addFields: {
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: [
                  'present',
                  'absent',
                  'halfday',
                  'workFromHome',
                  'sickLeave',
                  'paidLeave',
                  'earnedLeave',
                  'holiday',
                ],
                as: 'status',
                in: {
                  k: '$$status',
                  v: {
                    $size: {
                      $filter: {
                        input: '$attendance',
                        cond: { $eq: ['$$this.status', '$$status'] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: '$_id.employeeId',
          employeeId: '$_id.employee.employeeId',
          dateOfBirth: '$_id.employee.personalDetails.dateOfBirth',
          joiningDate: '$_id.employee.joiningDate',
          candidateName: '$_id.employee.personalDetails.candidateName',
          officialDetails: '$_id.officialDetails',
          emergencyContactInformation:
            '$_id.employee.personalDetails.emergencyContactInformation',
          emailAddress: '$_id.employee.personalDetails.emailAddress',
          contactNumber: '$_id.employee.personalDetails.contactNumber',
          gender: '$_id.employee.personalDetails.gender',
          salary: '$_id.employee.salary',
          address: '$_id.employee.address',
          activeEmployee: '$_id.employee.activeEmployee',
          leaveBalance: '$_id.employee.leaveBalance',
          statusCounts: 1,
          attendance: 1,
        },
      },
    ]);

    const totalCounts = {
      present: 0,
      absent: 0,
      halfday: 0,
      workFromHome: 0,
      sickLeave: 0,
      paidLeave: 0,
      earnedLeave: 0,
      holiday: 0,
    };

    attendanceData.forEach((entry) => {
      entry.attendance.forEach((record) => {
        totalCounts[record.status]++;
      });
    });

    const { uniqueDepartments, totalUniqueDepartments } =
      await getUniqueDepartments();
    res.status(200).json({
      status: true,
      results: attendanceData.length,
      totalCounts,
      uniqueDepartments,
      totalUniqueDepartments,
      attendance: attendanceData.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update the employee Attendance
export const updateAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(404).json({
        success: false,
        message: 'employeeId is not provided in params',
      });
    }
    const { status } = req.body;
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'status is not provided',
      });
    }

    // Find the attendance record by ID
    const attendanceRecord = await Attendance.findOne({
      employeeId: employeeId,
    });
    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Update the attendance record

    attendanceRecord.status === 'absent'
      ? await updateAttendanceToHalfDay(attendanceRecord)
      : (attendanceRecord.status = status);

    res.status(200).json({
      success: true,
      data: attendanceRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete attendance record
export const deleteAttendanceByIdAndDate = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'employeeId is required in params',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date is required in query parameters',
      });
    }

    // Convert the date string from the request query to a Date object
    const targetDate = new Date(date);

    // Find and delete attendance records for the specified employeeId and date
    const deletedAttendanceRecords = await Attendance.deleteMany({
      employeeId: employeeId,
      date: targetDate,
    });

    if (
      !deletedAttendanceRecords ||
      deletedAttendanceRecords.deletedCount === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          'Attendance records not found for the specified employeeId and date',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance records deleted successfully',
      data: deletedAttendanceRecords,
    });
  } catch (error) {
    console.error('Error deleting attendance records:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting attendance records',
    });
  }
};

export const getAttendanceByDepartment = async (req, res, next) => {
  try {
    const {
      department,
      startMonth,
      startYear,
      startDay,
      endMonth,
      endYear,
      endDay,
    } = req.query;

    if (
      !department ||
      !startYear ||
      !startMonth ||
      !startDay ||
      !endYear ||
      !endMonth ||
      !endDay
    ) {
      return next(new AppError('Please provide all required parameters', 400));
    }

    // Calculate the start and end dates for the selected month and year
    const startDate = moment(
      `${startYear}-${startMonth}-${startDay}`,
      'YYYY-MM-DD'
    ).toDate();
    const endDate = moment(
      `${endYear}-${endMonth}-${endDay}`,
      'YYYY-MM-DD'
    ).toDate();

    const statusTypes = [
      'present',
      'absent',
      'halfday',
      'workFromHome',
      'sickLeave',
      'paidLeave',
      'earnedLeave',
      'holiday',
    ];

    const attendanceByDepartment = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'employees', // Adjust based on the actual collection name
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      {
        $unwind: '$employee',
      },
      {
        $match: {
          'employee.jobDetails.department': department,
        },
      },
      {
        $group: {
          _id: '$employeeId',
          candidateName: { $first: '$employee.candidateName' },
          department: { $first: '$employee.jobDetails.department' },
          monthlyOvertimeHours: {
            $first: '$employee.monthlyOvertimeHours',
          },
          statusCounts: {
            $push: {
              status: '$status',
              count: 1,
            },
          },
          attendanceData: {
            $push: {
              _id: '$_id',
              employeeId: '$employee.employeeId',
              date: '$date',
              status: '$status',
              formattedDate: '$formattedDate',
            },
          },
        },
      },
      {
        $addFields: {
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: statusTypes,
                as: 'statusType',
                in: {
                  k: '$$statusType',
                  v: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$statusCounts',
                            as: 'statusObj',
                            cond: {
                              $eq: ['$$statusObj.status', '$$statusType'],
                            },
                          },
                        },
                        as: 'filteredStatus',
                        in: '$$filteredStatus.count',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          employeeId: '$_id',
          candidateName: 1,
          department: 1,
          monthlyOvertimeHours: 1,
          statusCounts: 1,
          attendanceData: '$attendanceData',
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: attendanceByDepartment.length,
      attendance: attendanceByDepartment,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

export async function login(req, res) {
  try {
    const { employeeId } = req.params;

    const employee = await findEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employeeId: employeeId,
      date: currentDate,
    });

    // Check if existing attendance has the same formatted date
    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today',
      });
    }

    // Create a new attendance record with loggedInTime
    const attendanceRecord = new Attendance({
      employeeId: employeeId,
      loggedInTime: new Date(),
      date: currentDate,
      status: req.body.status,
    });

    await attendanceRecord.save();

    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    await updateMonthlyOvertime(employeeId, startDate, endDate);

    res.status(200).json({
      message: 'Logged in successfully',
      attendanceRecord,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}

export async function logout(req, res) {
  try {
    const { employeeId } = req.params;
    const employee = await findEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if there is a corresponding logout record for today
    const existingLogoutRecord = await Attendance.findOne({
      employeeId,
      loggedOutTime: { $ne: null },
      date: {
        $gte: moment().startOf('day').toDate(),
        $lt: moment().endOf('day').toDate(),
      },
    });

    if (existingLogoutRecord) {
      return res.status(400).json({
        success: false,
        message: 'Logout already marked for today',
      });
    }

    // Find the latest attendance record where loggedOutTime is null
    const latestRecord = await Attendance.findOne({
      employeeId,
      loggedOutTime: null,
    });

    if (latestRecord) {
      // Check if there is a corresponding login record
      const correspondingLoginRecord = await Attendance.findOne({
        employeeId,
        loggedInTime: { $ne: null },
        loggedOutTime: null,
      });

      if (!correspondingLoginRecord) {
        return res.status(400).json({
          success: false,
          message: 'Cannot log out without a corresponding login',
        });
      }

      // Update the loggedOutTime
      latestRecord.loggedOutTime = new Date();
      await latestRecord.save();

      const startDate = new Date(
        latestRecord.date.getFullYear(),
        latestRecord.date.getMonth(),
        1
      );
      const endDate = new Date(
        latestRecord.date.getFullYear(),
        latestRecord.date.getMonth() + 1,
        0
      );

      await updateMonthlyOvertime(employeeId, startDate, endDate);

      res.status(200).json({
        message: 'Logged out successfully',
        latestRecord,
      });
    } else {
      res.status(404).json({ message: 'No active session found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function calculateMonthlyOvertime(employeeId, startDate, endDate) {
  try {
    // Fetch attendance records for the specified week
    const attendanceRecords = await Attendance.find({
      employeeId: employeeId,
      loggedInTime: { $gte: startDate, $lte: endDate },
      loggedOutTime: { $gte: startDate, $lte: endDate },
    });

    let totalWorkHours = 0;
    let totalDaysWorked = 0;

    // Calculate total work hours for the month and days worked
    attendanceRecords.forEach((record) => {
      const loggedInTime = record.loggedInTime.getTime();
      const loggedOutTime = record.loggedOutTime.getTime();
      const workHours = (loggedOutTime - loggedInTime) / (1000 * 60 * 60); // Convert milliseconds to hours

      totalWorkHours += workHours;
      totalDaysWorked += 1;
    });

    return { totalWorkHours, totalDaysWorked };
  } catch (error) {
    throw new Error(
      `Error calculating monthlyOvertimeHours work hours: ${error.message}`
    );
  }
}

async function updateMonthlyOvertime(employeeId, startDate, endDate) {
  try {
    // Call the calculateWeeklyOvertime function to get total work hours
    const { totalWorkHours, totalDaysWorked } = await calculateMonthlyOvertime(
      employeeId,
      startDate,
      endDate
    );

    // Define regular working hours per day (adjust as needed)
    const regularHoursPerDay = 8;

    // Calculate monthly overtime
    const monthlyOvertimeHours = Math.max(
      0,
      totalWorkHours - totalDaysWorked * regularHoursPerDay
    );

    // Update the monthlyOvertimeHours field in the Employee model
    await Employee.updateOne(
      { _id: employeeId },
      {
        $set: {
          monthlyOvertimeHours,
        },
      }
    );

    if (startDate.getDate() === 1) {
      // Reset the monthlyOvertimeHours and daysWorked fields
      await Employee.updateOne(
        { _id: employeeId },
        {
          $set: {
            monthlyOvertimeHours: 0,
          },
        }
      );
    }

    return monthlyOvertimeHours;
  } catch (error) {
    throw new Error(
      `Error updating monthlyOvertimeHours overtime: ${error.message}`
    );
  }
}

export async function updateAttendanceToHalfDay(attendance) {
  const currentHour = new Date().getHours();

  // Check if the current time falls within the allowed range for marking a half day
  if (
    (currentHour >= 9 && currentHour < 13) ||
    (currentHour >= 14 && currentHour < 19)
  ) {
    // Update the attendance status to halfday
    attendance.status = 'halfday';

    // Set loggedInTime and loggedOutTime based on the current time
    if (currentHour < 13) {
      attendance.loggedInTime = new Date().setHours(9, 30, 0, 0); // Set to 9:30 AM
      attendance.loggedOutTime = new Date().setHours(13, 30, 0, 0); // Set to 1:30 PM
    } else {
      attendance.loggedInTime = new Date().setHours(14, 30, 0, 0); // Set to 2:30 PM
      attendance.loggedOutTime = new Date().setHours(18, 30, 0, 0); // Set to 6:30 PM
    }
  }

  // Save the updated attendance record
  return attendance.save();
}
