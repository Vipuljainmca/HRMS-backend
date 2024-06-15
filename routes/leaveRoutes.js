import { Router } from 'express';
import {
  createLeave,
  deleteLeaveById,
  getAllLeaves,
  getAllLeavesWithType,
  getLeaveByEmployeeId,
} from '../controllers/leaveController.js';

const router = Router();

router.route('/leaveType').get(getAllLeavesWithType);

router.route('/').get(getAllLeaves);

router
  .route('/:employeeId')
  .post(createLeave)
  .get(getLeaveByEmployeeId)
  .delete(deleteLeaveById);

export default router;
