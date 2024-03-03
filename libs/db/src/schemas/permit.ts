import { pgTable, uuid, varchar, pgEnum, timestamp, date, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { locations } from './location';

export const permitStatus = pgEnum('permit_status', ['APPROVED', 'REQUESTED', 'EXPIRED', 'ISSUED', 'SUSPEND']);

export const permits = pgTable('permits', {
  id: uuid('id').default(sql`gen_random_uuid()`),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  permit: varchar('permit', { length: 20 }).notNull(),
  status: permitStatus('status'),
  noiSent: timestamp('noi_sent'),
  approvedAt: timestamp('approved_at'),
  receivedAt: date('received_at').notNull(),
  priorPermit: boolean('prior_permit').notNull().default(false),
  expirtationDate: timestamp('expiration_date'),
}, (_permits) => ({
  locationIdIndex: uniqueIndex('location_id_idx').on(_permits.locationId)
}));

export type Permit = typeof permits.$inferSelect;
export type NewPermit = typeof permits.$inferInsert;
