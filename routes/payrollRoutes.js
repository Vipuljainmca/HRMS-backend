import { Router } from 'express';
import {
  createPayroll,
  updatePayroll,
  getPayrollByEmployeeId,
  deletePayroll,
  getAllPayroll,
  createAllPayroll,
} from '../controllers/payrollController.js';
const router = Router();

router.route('/:employeeId').post(createPayroll).get(getAllPayroll);

router.route('/allpayroll').post(createAllPayroll);
router
  .route('/:id')
  .patch(updatePayroll)
  .get(getPayrollByEmployeeId)
  .delete(deletePayroll);

export default router;
