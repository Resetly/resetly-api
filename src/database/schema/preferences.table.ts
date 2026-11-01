import { pgTable, uuid, varchar, time, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.table';

export const preferences = pgTable('preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 32 }).default('system').notNull(),
  reminderTime: time('reminder_time'),
  notificationsEnabled: boolean('notifications_enabled').default(false).notNull(),
  timezone: varchar('timezone', { length: 64 }).default('UTC').notNull(),
});

export type Preference = typeof preferences.$inferSelect;
export type NewPreference = typeof preferences.$inferInsert;
