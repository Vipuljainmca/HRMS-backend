import { Router } from 'express';
import {
  deleteSingleUserData,
  getAllUsersData,
  getSingleUserData,
  updateSingleUserData,
} from '../controllers/userController.js';
import { login, signUp } from '../controllers/authController.js';
const router = Router();

router.get('/', getAllUsersData);
router.post('/signup', signUp);
router.post('/login', login);

router
  .route('/:id')
  .get(getSingleUserData)
  .patch(updateSingleUserData)
  .delete(deleteSingleUserData);

export default router;
