import { pgTable, uuid, varchar, pgEnum, timestamp, date, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { locations } from './location';
import { PermitStatus } from '@sharedTypes/models';

const permitStatusValues = Object.values(PermitStatus);
export const permitStatus = pgEnum('permit_status', [permitStatusValues[0], ...permitStatusValues.slice(1)]);

export const permits = pgTable('permits', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  locationId: uuid('location_id').notNull().unique().references(() => locations.id),
  permit: varchar('permit', { length: 20 }).notNull(),
  status: permitStatus('status'),
  noiSent: timestamp('noi_sent', { withTimezone: false }),
  approvedAt: timestamp('approved_at', { withTimezone: false }),
  receivedAt: date('received_at', { mode: 'date' }).notNull(),
  priorPermit: boolean('prior_permit').notNull().default(false),
  expirationDate: timestamp('expiration_date', { withTimezone: false }),
}, (permits) => ({
  locationIdIndex: uniqueIndex('location_id_idx').on(permits.locationId)
}));

export type Permit = typeof permits.$inferSelect;
export type NewPermit = typeof permits.$inferInsert;
