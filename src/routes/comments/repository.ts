import db from '@/db';
import { comments } from '@/models/comments';
import { eq } from 'drizzle-orm';

export const createComment = async (eventId: string, userId: string, text: string) => {
  return await db.insert(comments).values({ eventId, userId, text }).returning();
};

export const getCommentsForEvent = async (eventId: string) => {
  return await db.query.comments.findMany({
    orderBy: (commments, { desc }) => [desc(commments.createdAt)],
    with: {
      user: {
        columns: {
          name: true,
          avatar: true,
        },
      },
    },
    where: eq(comments.eventId, eventId),
  });
};
