import mongoose from 'mongoose';

const customDepartmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: [true, 'Department name must be required'],
  },
  departmentType: {
    type: String,
    required: [true, 'Department type must be required'],
  },
  departmentManager: {
    type: String,
  },
  departmentLead: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee',
  },
  employees: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Employee',
  },
});

const CustomDepartment = mongoose.model(
  'customDepartment',
  customDepartmentSchema
);

export default CustomDepartment;
