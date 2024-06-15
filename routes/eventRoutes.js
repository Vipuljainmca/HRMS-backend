import { Router } from 'express';
import { createEvent, getEvent } from '../controllers/eventController.js';

const router = Router();

router.route('/').get(getEvent).post(createEvent);

export default router;
