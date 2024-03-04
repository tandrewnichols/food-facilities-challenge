import data from '../data/Mobile_Food_Facility_Permit.json';
import { client, db } from './db';
import { sql } from 'drizzle-orm';
import { locations, NewLocation, permits, NewPermit } from './schemas';
import { PermitStatus } from '@sharedTypes/models';

const getPermitStatus = (status: string) => {
  if (status === 'APPROVED') {
    return PermitStatus.APPROVED;
  } else if (status === 'REQUESTED') {
    return PermitStatus.REQUESTED;
  } else if (status === 'SUSPEND') {
    return PermitStatus.SUSPENDED;
  } else if (status === 'EXPIRED') {
    return PermitStatus.EXPIRED;
  } else if (status === 'ISSUED') {
    return PermitStatus.ISSUED;
  }

  return undefined;
};

(async () => {
  await db.transaction(async (tx) => {
    for (const record of data) {
      const columns = record.FacilityType
        ? sql`(applicant, type, cnn)`
        : sql`(applicant, cnn)`;

      const values = record.FacilityType
        ? sql`${ record.Applicant }, ${ record.FacilityType }, ${ record.cnn }`
        : sql`${ record.Applicant }, ${ record.cnn }`;

      const [{ id: facilityId }] = await tx.execute(sql`
        WITH existing AS (
          SELECT id, applicant
          FROM facilities
          WHERE applicant = ${ record.Applicant }
        ),
        new AS (
          INSERT INTO facilities ${ columns }
          SELECT ${ values }
          WHERE NOT EXISTS (
            SELECT 1
            FROM existing
            WHERE applicant = ${ record.Applicant }
          )
          RETURNING id
        )
        SELECT COALESCE(
          (SELECT id FROM new),
          (SELECT id FROM existing)
        ) AS id
      `);

      const location: NewLocation = {
        facilityId: facilityId as string,
        locationId: record.locationid,
        description: record.LocationDescription,
        address: record.Address,
        blockLot: record.blocklot,
        block: record.block,
        lot: record.lot,
        foodItems: record.FoodItems,
        x: record.X || undefined,
        y: record.Y || undefined,
        latitude: record.Latitude,
        longitude: record.Longitude,
        location: record.Location.replace(/"/g, ''),
        schedule: record.Schedule,
        daysHours: record.dayshours,
        firePreventionDistricts: record['Fire Prevention Districts'],
        policeDistricts: record['Police Districts'],
        supervisorDistricts: record['Supervisor Districts'],
        zipCodes: record['Zip Codes'],
        neighborhoodsOld: record['Neighborhoods (old)']
      };

      const [{ id: locationId }] = await tx
        .insert(locations)
        .values([location])
        .returning();

      const year = record.Received.slice(0, 4);
      const month = record.Received.slice(4, 6);
      const day = record.Received.slice(6);

      const permit: NewPermit = {
        locationId: locationId as string,
        permit: record.permit,
        status: getPermitStatus(record.Status),
        noiSent: record.NOISent ? new Date(record.NOISent) : undefined,
        approvedAt: record.Approved ? new Date(record.Approved) : undefined,
        receivedAt: new Date(`${ year }-${ month }-${ day }`),
        priorPermit: record.PriorPermit === '1',
        expirationDate: record.ExpirationDate ? new Date(record.ExpirationDate) : undefined
      };

      await tx.insert(permits).values([permit]);
    }
  });

  await client.end();
})();
