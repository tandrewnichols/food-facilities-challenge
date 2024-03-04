import { db } from '@db/db';
import { facilities, permits, locations, Facility, Location, Permit } from '@db/schemas';
import { ilike, sql, eq, and } from 'drizzle-orm';
import z from 'zod';
import { PermitStatus } from '@sharedTypes/models';
import { BaseRequest } from '@sharedTypes/request';

const baseSchema = z.object({
  get: z.function(),
  logger: z.any()
});

type QueryResult = {
  facilities: Facility,
  locations: Location,
  permits: Permit
};

const mapResults = (results: QueryResult[]) =>
  results.map(({ facilities, locations, permits }) => ({
    facility: facilities,
    location: locations,
    permit: permits
  }));

export const searchApplicantSchema = baseSchema.extend({
  params: z.object({}),
  body: z.object({}),
  query: z.object({
    query: z.string(),
    status: z.nativeEnum(PermitStatus).optional(),
  })
});

export type SearchApplicantRequest = BaseRequest<typeof searchApplicantSchema>;

export const searchApplicant = async (req: SearchApplicantRequest) => {
  const {
    query,
    status,
  } = req.query;

  const likeClause = ilike(facilities.applicant, `%${ query }%`);
  const whereClause = status
    ? and(likeClause, eq(permits.status, status))
    : likeClause;

  const results = await db.select()
    .from(facilities)
    .innerJoin(locations, eq(locations.facilityId, facilities.id))
    .innerJoin(permits, eq(permits.locationId, locations.id))
    .where(whereClause)
    .limit(100);

  // Could group these by applicant, but the frontend is going
  // to display them each separately anyway.
  return mapResults(results);
};

export const searchAddressSchema = baseSchema.extend({
  params: z.object({}),
  body: z.object({}),
  query: z.object({
    query: z.string(),
  })
});

export type SearchAddressRequest = BaseRequest<typeof searchAddressSchema>;

export const searchAddress = async (req: SearchAddressRequest) => {
  const {
    query,
  } = req.query;

  const results = await db.select()
    .from(facilities)
    .innerJoin(locations, eq(locations.facilityId, facilities.id))
    .innerJoin(permits, eq(permits.locationId, locations.id))
    .where(ilike(locations.address, `%${ query }%`))
    .limit(100);

  return mapResults(results);
};

export const searchNearbySchema = baseSchema.extend({
  params: z.object({}),
  body: z.object({}),
  query: z.object({
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  })
});

export type SearchNearbyRequest = BaseRequest<typeof searchNearbySchema>;

export const searchNearby = async (req: SearchNearbyRequest) => {
  const {
    latitude,
    longitude,
  } = req.query;

  const results = await db.execute(sql`
    SELECT
      f.id as facility_id,
      f.applicant,
      f.type,
      f.cnn,

      l.id as location_id,
      l.facility_id as location_facility_id,
      l.location_id as raw_location_id,
      l.description,
      l.address,
      l.block_lot,
      l.block,
      l.lot,
      l.food_items,
      l.x,
      l.y,
      l.latitude,
      l.longitude,
      l.location,
      l.schedule,
      l.days_hours,
      l.fire_prevention_districts,
      l.police_districts,
      l.supervisor_districts,
      l.zip_codes,
      l.neighborhoods_old,
      l.distance,

      p.id as permit_id,
      p.location_id as permit_location_id,
      p.permit,
      p.status,
      p.noi_sent,
      p.approved_at,
      p.received_at,
      p.prior_permit,
      p.expiration_date
    FROM facilities f
    JOIN (
      SELECT *, point(${ longitude }, ${ latitude }) <@> (point(longitude, latitude)::point) as distance
      FROM locations
    ) l ON l.facility_id = f.id
    JOIN permits p
    ON p.location_id = l.id
    ORDER BY l.distance
    LIMIT 5
  `);

  return results.map((result) => ({
    facility: {
      id: result.facility_id,
      applicant: result.applicant,
      type: result.type,
      cnn: result.cnn,
    },
    location: {
      id: result.location_id,
      facilityId: result.location_facility_id,
      locationId: result.raw_location_id,
      description: result.description,
      address: result.address,
      blockLot: result.block_lot,
      block: result.block,
      lot: result.lot,
      foodItems: result.food_items,
      x: result.x,
      y: result.y,
      latitude: result.latitude,
      longitude: result.longitude,
      location: result.location,
      schedule: result.schedule,
      daysHours: result.days_hours,
      firePreventionDistricts: result.fire_prevention_districts,
      policeDistricts: result.police_districts,
      supervisorDistricts: result.supervisor_districts,
      zipCodes: result.zip_codes,
      neighborhoodsOld: result.neighborhoods_old,
      distance: result.distance
    },
    permit: {
      id: result.permit_id,
      locationId: result.permit_location_id,
      permit: result.permit,
      status: result.status,
      noiSent: result.noi_sent,
      approvedAt: result.approved_at,
      receivedAt: result.received_at,
      priorPermit: result.prior_permit,
      expirationDate: result.expiration_date,
    }
  }));
};
