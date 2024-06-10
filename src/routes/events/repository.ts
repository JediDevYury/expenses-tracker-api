import { eq } from 'drizzle-orm';

import db from '@/db';
import { events } from '@/models/events';

export const createEvent = async (
  title: string,
  description: string,
  start: Date,
  creatorId: string
) => {
  return await db.insert(events).values({ title, description, start, creatorId }).returning();
};

export const updateEvent = async (
  title: string,
  description: string,
  start: Date,
  eventId: string
) => {
  const [post] = await db
    .update(events)
    .set({ title, description, start })
    .where(eq(events.id, eventId))
    .returning();

  return post;
};

export const deleteEvent = async (eventId: string) => {
  await db.delete(events).where(eq(events.id, eventId));
};

export const getEvent = async (eventId: string) => {
  return await db.query.events.findFirst({
    orderBy: (events, { desc }) => [desc(events.start)],
    with: {
      user: {
        columns: {
          name: true,
          avatar: true,
        },
      },
    },
    where: eq(events.id, eventId),
  });
};

export const getEventsCreatedByUser = async (userId: string) => {
  return await db.select().from(events).where(eq(events.creatorId, userId)).orderBy(events.start);
};

export const getAllEvents = async () => {
  return await db.query.events.findMany({
    orderBy: (events, { desc }) => [desc(events.start)],
    with: {
      user: {
        columns: {
          name: true,
          avatar: true,
        },
      },
    },
  });
};

export const getUpcomingEvents = async () => {
  return await db.query.events.findMany({
    orderBy: (events, { desc }) => [desc(events.start)],
    with: {
      user: {
        columns: {
          name: true,
          avatar: true,
        },
      },
    },
    where: (events, { gt }) => gt(events.start, new Date()),
  });
};

export const updateEventImage = async (eventId: string, imageUrl: string) => {
  const [event] = await db
    .update(events)
    .set({ image: imageUrl })
    .where(eq(events.id, eventId))
    .returning();

  return event;
};
