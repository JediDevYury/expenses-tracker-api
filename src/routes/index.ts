import { Router } from 'express';

import auth from './auth/api';
import events from './events/api';
import attendance from './attendance/api';
import comments from './comments/api';

const router = Router();

router.use('/auth', auth);
router.use('/events', events);
router.use('/attendance', attendance);
router.use('/comments', comments);

export default router;
