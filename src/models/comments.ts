import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '@/models/users';
import { events } from '@/models/events';
import { relations } from 'drizzle-orm';

export const comments = pgTable('comments', {
  eventId: uuid('event_id')
    .references(() => events.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));
