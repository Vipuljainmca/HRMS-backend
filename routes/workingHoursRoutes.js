import { Router } from 'express';
import {
  getWorkingHours,
  loggedIn,
  loggedOut,
} from '../controllers/workingHoursController.js';

const router = Router();

router.route('/').post(loggedIn).get(getWorkingHours);
router.patch('/logout', loggedOut);

export default router;
