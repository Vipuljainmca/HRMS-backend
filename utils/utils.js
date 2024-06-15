import Employee from '../models/employeeModel.js';

export async function findEmployeeById(employeeId) {
  try {
    if (!employeeId) {
      return null;
    }
    const employee = await Employee.findById(employeeId);

    return employee;
  } catch (error) {
    console.error('Error finding employee by ID:', error);
    return null;
  }
}
