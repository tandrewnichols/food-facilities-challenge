import { pgTable, uuid, varchar, pgEnum, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const facilityType = pgEnum('facility_type', ['Truck', 'Push Cart']);

export const facilities = pgTable('facilities', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  applicant: varchar('applicant', { length: 200 }).notNull(),
  type: facilityType('type'),
  cnn: varchar('cnn', { length: 20 }).notNull(),
}, (facilities) => ({
  applicantIndex: index('applicant_idx').on(facilities.applicant),
}));

export type Facility = typeof facilities.$inferSelect;
export type NewFacility = typeof facilities.$inferInsert;
