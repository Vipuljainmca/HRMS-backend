// controllers/attendanceController.js
import Payroll from '../models/payrollModel.js';
import Employee from '../models/employeeModel.js';
import { findEmployeeById } from '../utils/utils.js';
export const createPayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      payPeriod,
      bankName,
      accountNumber,
      ifscCode,
      panCard,
      aadharCard,
      basicSalary,
      advanceSalary,
      deductions,
      grossSalary,
    } = req.body;

    // Check if the employee exists
    const employee = findEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if a payroll record already exists for the given pay period and employee
    const existingPayroll = await Payroll.findOne({ employeeId, panCard });
    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message:
          'Payroll record already exists for the given pay period and employee',
      });
    }

    // Create the payroll record
    const newPayrollRecord = new Payroll({
      employeeId,
      payPeriod,
      bankName,
      accountNumber,
      ifscCode,
      panCard,
      aadharCard,
      basicSalary,
      advanceSalary,
      deductions,
      grossSalary,
    });

    await newPayrollRecord.save();

    res.status(201).json({
      success: true,
      message: 'Payroll created successfully!',
      data: newPayrollRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getPayrollByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if the employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Retrieve payroll records for the given employee
    const payrollRecords = await Payroll.find({ employeeId });

    res.status(200).json({
      success: true,
      data: payrollRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updatePayroll = async (req, res) => {
  try {
    const updateFields = req.body;

    // Find the payroll record by ID
    const payrollRecord = await Payroll.findById(req.params.id);
    if (!payrollRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    // Update the payroll record
    Object.assign(payrollRecord, updateFields);
    const updatedPayrollRecord = await payrollRecord.save();

    res.status(200).json({
      success: true,
      data: updatedPayrollRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    // Find the payroll record by ID and delete it
    const deletedPayrollRecord = await Payroll.findByIdAndDelete(req.params.id);
    if (!deletedPayrollRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    res.status(201).json({
      success: 'Successfully deleted',
      data: deletedPayrollRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAllPayroll = async (req, res) => {
  try {
    // Retrieve all payroll records
    const payroll = await Payroll.find().populate('employeeId');

    res.status(200).json({
      success: true,
      results: payroll.length,
      payroll: payroll.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createAllPayroll = async (req, res) => {
  try {
    const payrollDataList = req.body;

    // Validate that the request body is an array
    if (!Array.isArray(payrollDataList)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Expecting an array of payroll data.',
      });
    }

    const createdPayrollRecords = [];

    for (const payrollData of payrollDataList) {
      const {
        employeeId,
        payPeriod,
        bankDetails,
        panCard,
        aadharCard, // Corrected field name
        salaryDetails,
      } = payrollData;

      // Check if the employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: `Employee with ID ${employeeId} not found`,
        });
      }

      // Check if a payroll record already exists for the given pay period and employee
      const existingPayroll = await Payroll.findOne({ employeeId, payPeriod });
      if (existingPayroll) {
        return res.status(400).json({
          success: false,
          message: `Payroll record already exists for the given pay period and employee ID ${employeeId}`,
        });
      }

      // Create the payroll record
      const newPayrollRecord = await Payroll.create({
        employeeId,
        payPeriod,
        bankDetails,
        panCard,
        aadharCard, // Corrected field name
        salaryDetails,
      });

      createdPayrollRecords.push(newPayrollRecord);
    }

    res.status(201).json({
      success: true,
      data: createdPayrollRecords,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteAllPayroll = async (req, res) => {
  try {
    // Delete all payroll records
    const result = await Payroll.deleteMany();

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} payroll records successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
