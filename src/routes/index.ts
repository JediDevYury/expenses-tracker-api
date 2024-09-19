import { Router } from 'express';

import auth from './auth/api';

const router = Router();

router.use('/auth', auth);

export default router;
