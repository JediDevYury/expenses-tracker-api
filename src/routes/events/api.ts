import { Router } from 'express';

import { authenticateUser } from '@/middlewares/authenticate-user';
import { UnauthorizedError } from '@/utils/errors';

import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  getEventsCreatedByUser,
  getUpcomingEvents,
  updateEvent,
  updateEventImage,
} from './repository';
import { upload } from '@/middlewares/upload';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { upcoming } = req.query;
    let events: any[] = [];
    if (upcoming) {
      events = await getUpcomingEvents();
    } else {
      events = await getAllEvents();
    }

    res.status(200).send({ events });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateUser, async (req, res, next) => {
  try {
    const { title, description, start } = req.body;
    const userId = req.user.id;

    const event = await createEvent(title, description, new Date(start), userId);

    res.status(200).send({ event });
  } catch (error) {
    next(error);
  }
});

router.get('/:eventId', async (req, res, next) => {
  try {
    const eventId = req.params.eventId;

    const event = await getEvent(eventId);

    res.status(200).send({ event });
  } catch (error) {
    next(error);
  }
});

router.put('/:eventId', authenticateUser, async (req, res, next) => {
  try {
    const { title, description, start } = req.body;
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const event = await getEvent(eventId);

    if (event && event.creatorId !== userId)
      throw new UnauthorizedError('Event does not belong to user');

    const updatedEvent = await updateEvent(title, description, new Date(start), eventId);

    res.status(200).send({ event: updatedEvent });
  } catch (error) {
    next(error);
  }
});

router.delete('/:eventId', authenticateUser, async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const event = await getEvent(eventId);

    if (event && event.creatorId !== userId)
      throw new UnauthorizedError('Event does not belong to user');

    await deleteEvent(eventId);

    res.status(200).send({ message: 'Successfully deleted post' });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const events = await getEventsCreatedByUser(userId);

    res.status(200).send({ events });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:eventId/upload',
  upload.single('image'),
  authenticateUser,
  async (req, res, next) => {
    try {
      if (!req.file || Object.keys(req.file).length === 0) {
        return res.status(400).send('No file was uploaded.');
      }
      const eventId = req.params.eventId;
      const userId = req.user.id;

      const event = await getEvent(eventId);

      if (event && event.creatorId !== userId)
        throw new UnauthorizedError('Event does not belong to user');

      const uploadPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      const updatedEvent = await updateEventImage(eventId, uploadPath);
      res.status(200).send({ event: updatedEvent });
    } catch (error) {
      console.log('error:', error);

      next(error);
    }
  }
);

export default router;
