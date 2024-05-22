import { pgTable, text, uuid, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { users } from '@/models/users';
import { events } from '@/models/events';
import { relations } from 'drizzle-orm';

export const attendance = pgTable(
  'attendance',
  {
    eventId: uuid('event_id')
      .references(() => events.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    status: text('status').notNull(),
    modifiedAt: timestamp('modified_at').defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.eventId, table.userId] }),
    };
  }
);
export const attendanceRelations = relations(attendance, ({ one }) => ({
  event: one(events, {
    fields: [attendance.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
}));
