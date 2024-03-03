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

export interface Candidate {
  locationId: string;
  applicant: string;
  facilityType?: FacilityType;
  cnn: string;
  locationDescription?: string;
  address: string;
  blocklot?: string;
  block?: string;
  lot?: string;
  permit: string;
  status?: PermitStatus;
  foodItems?: string;
  x?: string;
  y?: string;
  lat: string;
  long: string;
  schedule: string;
  daysHours?: string;
  NOISent?: string;
  approvedTimestamp?: string;
  received: string;
  priorPermit: boolean;
  expirationTimestamp?: string;
  location: string;
  firePreventionDistricts?: string;
  policeDistricts?: string;
  supervisorDistricts?: string;
  zipCodes?: string;
  neighborhoodsOld?: string;
}
