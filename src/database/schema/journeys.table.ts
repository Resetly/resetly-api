import { pgTable, uuid, text, timestamp, date, pgEnum, index } from 'drizzle-orm/pg-core';
import { habits } from './habits.table';

export const journeyStatusEnum = pgEnum('journey_status', ['active', 'paused', 'archived']);

export const journeys = pgTable(
  'journeys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    habitId: uuid('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    goal: text('goal'),
    status: journeyStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('journeys_habit_id_idx').on(table.habitId)],
);

export type Journey = typeof journeys.$inferSelect;
export type NewJourney = typeof journeys.$inferInsert;
