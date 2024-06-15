import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  payMonth: {
    type: String,
    required: true,
  },
  totalDaysWorked: {
    type: Number,
    default: 0,
  },

  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },

  panCard: {
    type: String,
    required: true,
    unique: true,
  },
  aadharCard: {
    type: String,
    required: true,
    unique: true,
  },

  basicSalary: {
    type: String,
    required: true,
  },
  advanceSalary: {
    type: String,
    required: true,
  },
  deductions: {
    type: String,
    required: true,
  },
  grossSalary: {
    type: String,
    required: true,
  },
});

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
