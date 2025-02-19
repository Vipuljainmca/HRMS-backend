import moment from 'moment';
import Employee from '../models/employeeModel.js';
import AppError from '../utils/AppError.js';

// Create a new employee
export const createEmployee = async (req, res, next) => {
  try {
    // Extract relevant fields from req.body
    console.log("req body",req.body)
    const {
      personalDetails: {
        candidateName,
        gender,
        dateOfBirth,
        originalBirthDay,
        martialStatus,
        contactNumber,
        bloodGroup,
        emailAddress,
        fathersName,
        aadharNumber,
        panNumber,
        emergencyContactInformation: { name, relationship, phone },
        presentAddress,
        permanentAddress,
      },

      officialDetails: {
        employeeId,
        idCardExpirationDate,
        designation,
        department,
        grade,
        joiningDate,
        grossSalary,
        officialEmailAddress,
        officialNumber,
        primaryReporting,
        secondaryReporting,
        lastDayOfWorking,
      },
      bankDetails: { bankName, accountNumber, ifscCode },

      leavesDetails: {
        leaveBalance,
        casualLeave,
        sickLeave,
        earnedLeave,
        maternityLeave,
        paternityLeave,
        beareavementLeave,
      },
      documentStatus: {
        aadharCard,
        panCard,
        tenthMarksheetCertificate,
        tweleveMarksheetCertificate,
        graduationMarksheetCertificate,
        mastersMarksheetCertificate,
        relievingLetter,
        experienceLetter,
        salarySlip,
        photo,
        policyAcknowledgement,
        idType,
        idStatus,
      },
    } = req.body;

    // Create a new Employee document
    const newEmployee = await Employee.create({
      personalDetails: {
        candidateName,
        gender,
        dateOfBirth,
        originalBirthDay,
        martialStatus,
        contactNumber,
        bloodGroup,
        emailAddress,
        fathersName,
        aadharNumber,
        panNumber,
        emergencyContactInformation: {
          name,
          relationship,
          phone,
        },
        presentAddress,
        permanentAddress,
      },
      officialDetails: {
        employeeId,
        idCardExpirationDate,
        designation,
        department,
        grade,
        joiningDate,
        grossSalary,
        officialEmailAddress,
        officialNumber,
        primaryReporting,
        secondaryReporting,
        lastDayOfWorking,
      },
      bankDetails: {
        bankName,
        accountNumber,
        ifscCode,
      },
      leavesDetails: {
        leaveBalance,
        casualLeave,
        sickLeave,
        earnedLeave,
        maternityLeave,
        paternityLeave,
        beareavementLeave,
      },
      documentStatus: {
        aadharCard,
        panCard,
        tenthMarksheetCertificate,
        tweleveMarksheetCertificate,
        graduationMarksheetCertificate,
        mastersMarksheetCertificate,
        relievingLetter,
        experienceLetter,
        salarySlip,
        photo,
        policyAcknowledgement,
        idType,
        idStatus,
      },
    });

    // Respond with the newly created employee object

    console.log(newEmployee);
    res.status(201).json({
      status: true,
      message: 'Employee created successfully',
      employees: newEmployee,
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      error: 'Failed to create employee',
      error,
    });
  }
};

export async function getUniqueDepartments() {
  try {
    // Use the aggregate method to group by the 'jobDetails.department' field and count
    const departmentsCount = await Employee.aggregate([
      {
        $group: {
          _id: '$officialDetails.department',
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract the departments and their count
    const uniqueDepartments = departmentsCount.map(
      (department) => department._id
    );
    const totalUniqueDepartments = uniqueDepartments.length;

    return { uniqueDepartments, totalUniqueDepartments };
  } catch (error) {
    console.error('Error getting unique departments:', error);
    throw error;
  }
}

// Get a list of employees on the server
export const getAllEmployees = async (req, res) => {
  try {
    // Get all employees
    const employees = await Employee.find().select('-__v');

    // Get unique departments and their count
    const { uniqueDepartments, totalUniqueDepartments } =
      await getUniqueDepartments();

    res.status(200).json({
      status: 'success',
      results: employees.length,
      uniqueDepartments,
      totalUniqueDepartments,
      employee: employees,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// Update an employee
export async function updateSingleEmployeeData(req, res, next) {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!employee) {
      return next(new AppError('No Employee Data found!', 404));
    }

    res.status(200).json({
      status: 'success',
      employee,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Get an employee
export async function getSingleEmployeeData(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return next(new AppError('No Employee Data found!', 404));
    }
    res.status(200).json({
      status: 'success',
      employee,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Delete an employee
export const deleteSingleEmployeeData = async (req, res, next) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return next(new AppError('No Employees Data found!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Employee successfully deleted',
      employee: deletedEmployee,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// Create multiple employees for testing purposes
export const createAllEmployeeData = async (req, res, next) => {
  try {
    const employees = await Employee.insertMany(req.body);
    if (!employees) {
      return next(new AppError('No Employees Data has been Added!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Employees successfully created',
      allEmployees: employees,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// Delete all employees data from the database
export const deleteAllEmployeeData = async (req, res, next) => {
  try {
    console.log('Deleting all employees...');
    const deletedAllEmployees = await Employee.deleteMany();
    console.log('Deleted all employees:', deletedAllEmployees);
    if (!deletedAllEmployees) {
      return next(new AppError('No Employees Data has been Deleted!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Employees successfully deleted',
      allEmployees: deletedAllEmployees,
    });
  } catch (error) {
    console.error('Error deleting all employees:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

export const getAllEmployeesFromDepartment = async (req, res, next) => {
  try {
    const department = req.query.department;

    if (!department) {
      return next(new AppError('Please provide department', 400));
    }
    const employee = await Employee.find({
      'jobDetails.department': { $regex: new RegExp(department, 'i') },
    }).select('-__v');

    res.status(200).json({
      status: 'success',
      results: employee.length,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

const sendNotification = (employee) => {
  // Implement your notification logic here (e.g., sending an email, push notification, etc.)
  console.log(
    `Notification: Tomorrow is ${employee.candidateName}'s birthday!`
  );
};

const sendNotificationForToday = (employee) => {
  console.log(`Notification: Today is ${employee.candidateName}'s birthday!`);
  // Implement your notification logic here for today's birthday
};
export const getBirthdaysInCurrentWeek = async (req, res) => {
  try {
    const currentDate = moment();

    // Calculate the start of the current week (Sunday)
    const startOfWeek = currentDate.clone().startOf('week');

    // Calculate the end of the current week (Saturday)
    const endOfWeek = currentDate.clone().endOf('week');

    // Calculate one day before the current date
    const oneDayBefore = currentDate.clone().subtract(1, 'day').startOf('day');

    // Use the MongoDB Aggregation Framework to filter birthdays
    const birthdaysInCurrentWeek = await Employee.aggregate([
      {
        $addFields: {
          birthMonth: { $month: '$dateOfBirth' }, // Extract the month component of dateOfBirth
          birthDay: { $dayOfMonth: '$dateOfBirth' }, // Extract the day component of dateOfBirth
        },
      },
      {
        $match: {
          $or: [
            // Birthdays within the current week
            {
              $and: [
                { birthMonth: currentDate.month() + 1 }, // Adding 1 because months are 0-indexed
                {
                  birthDay: {
                    $gte: startOfWeek.date(),
                    $lte: endOfWeek.date(),
                  },
                },
              ],
            },
            // Birthdays one day before the current date
            {
              $and: [
                { birthMonth: currentDate.month() + 1 }, // Adding 1 because months are 0-indexed
                { birthDay: oneDayBefore.date() },
              ],
            },
          ],
        },
      },
      // Project the desired fields in the output
      {
        $project: {
          _id: 0, // Exclude the '_id' field from the output
          candidateName: 1, // Include the 'candidateName' field
          dateOfBirth: 1, // Include the 'dateOfBirth' field
        },
      },
    ]);

    // Iterate through birthdays to send notifications
    birthdaysInCurrentWeek.forEach((employee) => {
      const employeeBirthDay = Number(moment(employee.dateOfBirth).format('D'));
      const currentDay = Number(moment().format('D'));

      if (employeeBirthDay === currentDay + 1) {
        // Send a notification (you need to implement the actual notification mechanism)

        sendNotification(employee);
      } else if (employeeBirthDay === currentDay) {
        sendNotificationForToday(employee);
      }
    });

    res.status(200).json({
      status: 'success',
      results: birthdaysInCurrentWeek.length,
      birthdaysInCurrentWeek,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
