import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { journeys } from './journeys.table';

export const checkInOutcomeEnum = pgEnum('check_in_outcome', ['maintained', 'setback']);

export const checkIns = pgTable(
  'check_ins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    journeyId: uuid('journey_id')
      .notNull()
      .references(() => journeys.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'string' }).notNull(),
    outcome: checkInOutcomeEnum('outcome').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('check_ins_journey_date_idx').on(table.journeyId, table.date),
    index('check_ins_journey_id_idx').on(table.journeyId),
  ],
);

export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;
