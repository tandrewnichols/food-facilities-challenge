export enum FacilityType {
  TRUCK = 'Truck',
  PUSH_CART = 'Push Cart'
}

export enum PermitStatus {
  APPROVED = 'APPROVED',
  REQUESTED = 'REQUESTED',
  EXPIRED = 'EXPIRED',
  ISSUED = 'ISSUED',
  SUSPENDED = 'SUSPEND'
}

export interface Facility {
  id: string;
  applicant: string;
  type?: FacilityType;
  cnn: string;
}

export interface Location {
  id: string;
  facilityId: string;
  locationId: string;
  description?: string;
  address: string;
  blockLot?: string;
  block?: string;
  lot?: string;
  foodItems?: string;
  x?: string;
  y?: string;
  latitude: string;
  longitude: string;
  schedule: string;
  daysHours?: string;
  location: string;
  firePreventionDistricts?: string;
  policeDistricts?: string;
  supervisorDistricts?: string;
  zipCodes?: string;
  neighborhoodsOld?: string;
  distance?: number;
}

export interface Permit {
  id: string;
  locationId: string;
  permit: string;
  status?: PermitStatus;
  noiSent?: string;
  approvedAt?: string;
  receivedAt: string;
  priorPermit: boolean;
  expirationDate?: string;
}

export interface SearchResponse {
  facility: Facility;
  location: Location;
  permit: Permit;
}
