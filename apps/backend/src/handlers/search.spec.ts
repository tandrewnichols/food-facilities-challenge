import {
  searchApplicant,
  searchAddress,
  searchNearby,
  SearchApplicantRequest,
  SearchAddressRequest,
  SearchNearbyRequest,
} from './search';
import { PermitStatus } from '@sharedTypes/models';

interface FakeDb {
  select: jest.Mock;
  from: jest.Mock;
  innerJoin: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  execute: jest.Mock;
}

jest.mock('@db/db', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    innerJoin: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    execute: jest.fn()
  }
}));
import { db as rawDb } from '@db/db';

jest.mock('drizzle-orm');
import { ilike, sql, eq, and } from 'drizzle-orm';

describe('handlers/search', () => {
  const db = rawDb as unknown as FakeDb;

  beforeEach(() => {
    db.select.mockReturnThis();
    db.from.mockReturnThis();
    db.innerJoin.mockReturnThis();
    db.where.mockReturnThis();
    db.limit.mockResolvedValue([
      {
        facilities: {
          a: true,
        },
        locations: {
          b: true,
        },
        permits: {
          c: true,
        }
      }
    ]);

    (ilike as jest.Mock).mockImplementation((col, query) => `${ col.name } ilike ${ query }`);
    (eq as jest.Mock).mockImplementation((col, val) => `${ col.name } = ${ val }`);
    (and as jest.Mock).mockImplementation((...clauses) => clauses.join(' and '));
    (sql as unknown as jest.Mock).mockImplementation((str) => str);
  });

  describe('.searchApplicant', () => {
    describe('with no status', () => {
      it('should query the db and return results', async () => {
        const req: SearchApplicantRequest = {
          query: {
            query: 'foo',
          }
        };

        await expect(searchApplicant(req)).resolves.toEqual([
          {
            facility: {
              a: true,
            },
            location: {
              b: true,
            },
            permit: {
              c: true,
            }
          }
        ]);

        expect(db.where).toHaveBeenCalledWith('applicant ilike %foo%');
      });
    });

    describe('with a status', () => {
      it('should query the db and return results', async () => {
        const req: SearchApplicantRequest = {
          query: {
            query: 'foo',
            status: PermitStatus.APPROVED
          }
        };

        await expect(searchApplicant(req)).resolves.toEqual([
          {
            facility: {
              a: true,
            },
            location: {
              b: true,
            },
            permit: {
              c: true,
            }
          }
        ]);

        expect(db.where).toHaveBeenCalledWith('applicant ilike %foo% and status = APPROVED');
      });
    });
  });

  describe('.searchAddress', () => {
    it('should query the db and return results', async () => {
      const req: SearchAddressRequest = {
        query: {
          query: 'foo',
        }
      };

      await expect(searchAddress(req)).resolves.toEqual([
        {
          facility: {
            a: true,
          },
          location: {
            b: true,
          },
          permit: {
            c: true,
          }
        }
      ]);

      expect(db.where).toHaveBeenCalledWith('address ilike %foo%');
    });
  });

  describe('.searchNearby', () => {
    beforeEach(() => {
      db.execute.mockResolvedValue([
        {
          facility_id: 'facility_id',
          applicant: 'applicant',
          type: 'type',
          cnn: 'cnn',
          location_id: 'location_id',
          location_facility_id: 'location_facility_id',
          raw_location_id: 'raw_location_id',
          description: 'description',
          address: 'address',
          block_lot: 'block_lot',
          block: 'block',
          lot: 'lot',
          food_items: 'food_items',
          x: 'x',
          y: 'y',
          latitude: 'latitude',
          longitude: 'longitude',
          location: 'location',
          schedule: 'schedule',
          days_hours: 'days_hours',
          fire_prevention_districts: 'fire_prevention_districts',
          police_districts: 'police_districts',
          supervisor_districts: 'supervisor_districts',
          zip_codes: 'zip_codes',
          neighborhoods_old: 'neighborhoods_old',
          distance: 'distance',
          permit_id: 'permit_id',
          permit_location_id: 'permit_location_id',
          permit: 'permit',
          status: 'status',
          noi_sent: 'noi_sent',
          approved_at: 'approved_at',
          received_at: 'received_at',
          prior_permit: 'prior_permit',
          expiration_date: 'expiration_date',
        }
      ]);
    });
    it('should query the db and return results', async () => {
      const req: SearchNearbyRequest = {
        query: {
          latitude: 12,
          longitude: 18
        }
      };

      await expect(searchNearby(req)).resolves.toEqual([
        {
          facility: {
            id: 'facility_id',
            applicant: 'applicant',
            type: 'type',
            cnn: 'cnn',
          },
          location: {
            id: 'location_id',
            facilityId: 'location_facility_id',
            locationId: 'raw_location_id',
            description: 'description',
            address: 'address',
            blockLot: 'block_lot',
            block: 'block',
            lot: 'lot',
            foodItems: 'food_items',
            x: 'x',
            y: 'y',
            latitude: 'latitude',
            longitude: 'longitude',
            location: 'location',
            schedule: 'schedule',
            daysHours: 'days_hours',
            firePreventionDistricts: 'fire_prevention_districts',
            policeDistricts: 'police_districts',
            supervisorDistricts: 'supervisor_districts',
            zipCodes: 'zip_codes',
            neighborhoodsOld: 'neighborhoods_old',
            distance: 'distance',
          },
          permit: {
            id: 'permit_id',
            locationId: 'permit_location_id',
            permit: 'permit',
            status: 'status',
            noiSent: 'noi_sent',
            approvedAt: 'approved_at',
            receivedAt: 'received_at',
            priorPermit: 'prior_permit',
            expirationDate: 'expiration_date',
          }
        }
      ]);
    });
  });
});
