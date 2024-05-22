import { Router } from 'express';

import { authenticateUser } from '@/middlewares/authenticate-user';
import { createComment, getCommentsForEvent } from './repository';

const router = Router();

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const { eventId, text } = req.body;
    const userId = req.user.id;

    const comment = await createComment(eventId, userId, text);

    res.status(200).send({ comment });
  } catch (error) {
    next(error);
  }
});

router.get('/event/:eventId', authenticateUser, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const comments = await getCommentsForEvent(eventId);

    res.status(200).send({ comments });
  } catch (error) {
    next(error);
  }
});

export default router;
