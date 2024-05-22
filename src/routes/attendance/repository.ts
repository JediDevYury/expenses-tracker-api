import { and, eq } from 'drizzle-orm';

import db from '@/db';
import { attendance } from '@/models/attendance';
import { NotFoundError } from '@/utils/errors';

export const attendEvent = async (eventId: string, userId: string, status: string) => {
  return await db
    .insert(attendance)
    .values({ eventId, userId, status, modifiedAt: new Date() })
    .returning();
};

export const cancelAttendance = async (eventId: string, userId: string) => {
  const result = await db
    .delete(attendance)
    .where(and(eq(attendance.eventId, eventId), eq(attendance.userId, userId)))
    .returning();

  if (!result.length) {
    throw new NotFoundError('Attendance not found');
  }
};

export const getAttendanceForEvent = async (eventId: string) => {
  return await db.query.attendance.findMany({
    where: eq(attendance.eventId, eventId),
    columns: {
      status: true,
      modifiedAt: true,
      userId: true,
    },
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

export const getAttendanceForUser = async (userId: string) => {
  return await db.query.attendance.findMany({
    where: eq(attendance.userId, userId),
    columns: {
      status: true,
      modifiedAt: true,
      userId: true,
      eventId: true,
    },
    with: {
      event: {
        columns: {
          title: true,
          start: true,
          id: true,
          image: true,
        },
      },
    },
  });
};
