import CustomDepartment from '../models/customDepartmentModel.js';

export async function createCustomDepartment(req, res) {
  try {
    const { departmentName, departmentType } = req.body;

    if (!departmentName || !departmentType) {
      return res.status(400).json({
        error: 'Please provide name of the department and type of department',
      });
    }
    const customDepartment = await CustomDepartment.create({
      departmentName,
      departmentType,
    });
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      customDepartment,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}
export async function getAllCustomDepartment(req, res) {
  try {
    const customDepartment = await CustomDepartment.find()
      .populate('departmentLead')
      .populate('employees');
    res.status(201).json({
      success: true,
      results: customDepartment.length,
      customDepartment,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}
export async function getAllCustomDepartmentWithName(req, res) {
  const { departmentName } = req.query;
  try {
    const customDepartment = await CustomDepartment.find({
      departmentName,
    }).populate('departmentLead');
    res.status(201).json({
      success: true,

      customDepartment,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

export async function updateCustomDepartment(req, res) {
  const { departmentId } = req.params;
  const {
    departmentName,
    departmentType,
    departmentManager,
    departmentLead,
    employees,
  } = req.body;
  try {
    if (
      !departmentId ||
      !departmentName ||
      !departmentType ||
      !departmentManager ||
      !departmentLead ||
      !employees
    ) {
      return res.status(400).json({
        error: 'Please provide name of the department and type of department',
      });
    }
    const customDepartment = await CustomDepartment.findByIdAndUpdate(
      departmentId,
      {
        departmentName,
        departmentType,
        departmentManager,
        departmentLead,
        employees,
      },
      { new: true }
    );
    res.status(201).json({
      success: true,
      message: 'Department updated successfully',
      customDepartment,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}
