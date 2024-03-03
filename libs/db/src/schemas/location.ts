import { pgTable, uuid, varchar, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { facilities } from './facility';

export const locations = pgTable('locations', {
  id: uuid('id').default(sql`gen_random_uuid()`),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id),
  locationId: varchar('location_id', { length: 20 }),
  description: varchar('description', { length: 500 }),
  address: varchar('address', { length: 100 }),
  blockLot: varchar('block_lot', { length: 20 }),
  block: varchar('block', { length: 10 }),
  lot: varchar('lot', { length: 10 }),
  foodItems: varchar('food_items', { length: 500 }),
  x: numeric('x'),
  y: numeric('y'),
  latitude: numeric('latitude').notNull(),
  longitude: numeric('longitude').notNull(),
  location: varchar('location', { length: 100 }),
  schedule: varchar('schedule', { length: 400 }),
  daysHours: varchar('days_hours', { length: 50 }),
  firePreventionDistricts: varchar('fire_prevention_districts', { length: 5 }),
  policeDistricts: varchar('police_districts', { length: 5 }),
  supervisorDistricts: varchar('supervisor_districts', { length: 5 }),
  zipCodes: varchar('zip_codes', { length: 10 }),
  neighborhoodsOld: varchar('neighborhoods_old', { length: 5 }),
});

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
