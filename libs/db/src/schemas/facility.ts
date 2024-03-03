import { pgTable, uuid, varchar, pgEnum, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { FacilityType } from '@sharedTypes/models';

// I don't love how typescript makes you do this, but at least
// I'm only defining the possible values in one place
const facilityTypeValues = Object.values(FacilityType);
export const facilityType = pgEnum('facility_type', [facilityTypeValues[0], ...facilityTypeValues.slice(1)]);

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
