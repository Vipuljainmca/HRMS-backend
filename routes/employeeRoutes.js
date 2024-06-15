import { Router } from 'express';
import {
  createEmployee,
  deleteSingleEmployeeData,
  getAllEmployees,
  getAllEmployeesFromDepartment,
  getSingleEmployeeData,
  getBirthdaysInCurrentWeek,
  updateSingleEmployeeData,
} from '../controllers/employeeController.js';

const router = Router();

router.get('/employeesBirthDays', getBirthdaysInCurrentWeek);
router.route('/').post(createEmployee).get(getAllEmployees);
router.route('/department').get(getAllEmployeesFromDepartment);
router
  .route('/:id')
  .get(getSingleEmployeeData)
  .patch(updateSingleEmployeeData)
  .delete(deleteSingleEmployeeData);

export default router;
