import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from '@/models/users';
import { relations } from 'drizzle-orm';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image: text('image'),
  creatorId: uuid('creatorId')
    .references(() => users.id)
    .notNull(),
  start: timestamp('start'),
});

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
}));
