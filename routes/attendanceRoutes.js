import { Router } from 'express';
import {
  getSingleEmployeeAttendanceWithDate,
  getAttendanceByEmployeeId,
  getAllEmployeesAttendanceWithDate,
  updateAttendance,
  deleteAttendanceByIdAndDate,
  getAttendanceByDepartment,
  login,
  logout,
  generateReport,
} from '../controllers/attendanceController.js';
const router = Router();

router.get('/generateAttendance/:employeeId', generateReport);

router.route('/byDate').get(getSingleEmployeeAttendanceWithDate);

router.route('/allByDate').get(getAllEmployeesAttendanceWithDate);

router.route('/department').get(getAttendanceByDepartment);

router.post('/login/:employeeId', login);

router.patch('/logout/:employeeId', logout);

router
  .route('/:employeeId')
  .get(getAttendanceByEmployeeId)
  .patch(updateAttendance)
  .delete(deleteAttendanceByIdAndDate);

export default router;
