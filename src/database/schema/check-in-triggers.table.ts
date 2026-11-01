import { pgTable, uuid, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { checkIns } from './check-ins.table';

export const checkInTriggers = pgTable(
  'check_in_triggers',
  {
    checkInId: uuid('check_in_id')
      .notNull()
      .references(() => checkIns.id, { onDelete: 'cascade' }),
    trigger: varchar('trigger', { length: 128 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.checkInId, table.trigger] })],
);

export type CheckInTrigger = typeof checkInTriggers.$inferSelect;
export type NewCheckInTrigger = typeof checkInTriggers.$inferInsert;
