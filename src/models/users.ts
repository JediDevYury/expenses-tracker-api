import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const totp = pgTable('totp', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(), // Foreign key to the users table
  otpSecret: text('otp_secret').notNull(),
  otpEnabled: boolean('otp_enabled').default(false),
  otpVerified: boolean('otp_verified').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
});
