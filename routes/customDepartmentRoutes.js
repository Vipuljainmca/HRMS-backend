import { Router } from 'express';
import {
  createCustomDepartment,
  getAllCustomDepartment,
  getAllCustomDepartmentWithName,
  updateCustomDepartment,
} from '../controllers/customDepartmentController.js';

const router = Router();

router.route('/').get(getAllCustomDepartment).post(createCustomDepartment);

router.patch('/:departmentId', updateCustomDepartment);

router.get('/bydepartment', getAllCustomDepartmentWithName);

export default router;
