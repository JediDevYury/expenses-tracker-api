import { Router } from 'express';

import { authenticateUser } from '@/middlewares/authenticate-user';
import {
  attendEvent,
  cancelAttendance,
  getAttendanceForEvent,
  getAttendanceForUser,
} from '@/routes/attendance/repository';

const router = Router();

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const { eventId, status } = req.body;
    const userId = req.user.id;

    const attendance = await attendEvent(eventId, userId, status);

    res.status(200).send({ attendance });
  } catch (error) {
    next(error);
  }
});

router.delete('/event/:eventId', authenticateUser, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    await cancelAttendance(eventId, userId);

    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

router.get('/event/:eventId', authenticateUser, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const attendance = await getAttendanceForEvent(eventId);

    res.status(200).send({ attendance });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:userId', authenticateUser, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const attendance = await getAttendanceForUser(userId);

    res.status(200).send({ attendance });
  } catch (error) {
    next(error);
  }
});

export default router;
