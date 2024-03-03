import { Request, Response } from 'express';
import { db } from '@db/db';
import { facilities, permits, locations } from '@db/schemas';
import { like, sql, or, and, eq } from 'drizzle-orm';
import z from 'zod';
import { PermitStatus } from '@sharedTypes/models';
import { BaseRequest } from '@sharedTypes/request';

export const searchApplicantSchema = z.object({
  params: z.object({}),
  body: z.object({}),
  query: z.object({
    query: z.string(),
    status: z.nativeEnum(PermitStatus).optional(),
    offset: z.number().optional().default(0),
  })
});

type SearchApplicantRequest = BaseRequest<typeof searchApplicantSchema>;

export const searchApplicant = async (req: SearchApplicantRequest) => {
  const {
    query,
    status,
    offset,
  } = req.query;

  await db.query.facilities.findMany({
    limit: 50,
    offset,
    where: like(facilities.applicant, sql.placeholder(query)),
    with: {
      locations: {
        with: {
          permits: status ? {
            where: eq(permits, status)
          } : true
        }
      }
    }
  });
};

export const searchAddressSchema = z.object({
  params: z.object({}),
  body: z.object({}),
  query: z.object({
    query: z.string(),
    offset: z.number().optional().default(0),
  })
});

type SearchAddressRequest = BaseRequest<typeof searchAddressSchema>;

export const searchAddress = async (req: SearchAddressRequest) => {
  const {
    query,
    offset
  } = req.query;

  return await db.query.facilities.findMany({
    limit: 50,
    offset,
    with: {
      locations: {
        where: like(locations.address, query),
        with: {
          permits: true
        }
      }
    }
  });
};

export const searchNearbySchema = z.object({
  params: z.object({}),
  body: z.object({}),
  query: z.object({
    latitude: z.number(),
    longitude: z.number(),
  })
});

type SearchNearbyRequest = BaseRequest<typeof searchNearbySchema>;

export const searchNearby = async (req: SearchNearbyRequest) => {
  const {
    latitude,
    longitude,
  } = req.query;

  return await db.execute(sql`
    SELECT f.*, l.*, p.*
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
};
