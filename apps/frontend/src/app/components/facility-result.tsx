import { Facility, Location, Permit, PermitStatus } from '@sharedTypes/models';
import { format } from 'date-fns';

interface Props {
  facility: Facility;
  location: Location;
  permit: Permit;
}

const statusClasses = {
  [PermitStatus.APPROVED]: 'text-success',
  [PermitStatus.REQUESTED]: 'text-warning',
  [PermitStatus.EXPIRED]: 'text-danger',
  [PermitStatus.SUSPENDED]: 'text-danger',
  [PermitStatus.ISSUED]: 'text-success'
};

export default function Facility({ facility, location, permit }: Props) {
  return (
    <div className="border border-gray-300 rounded w-full p-8 space-y-4">
      <div className="flex flex-col items-center">
        <div>
          <span className="font-bold">{ facility.applicant } </span>
          {facility.type && <span>({ facility.type })</span>}
        </div>
        <div>{ location.address }</div>
      </div>
      <div className="flex flex-row items-start space-x-10">
        <div>
          <div className="whitespace-nowrap">Permit: { permit.permit }</div>
          <div className="whitespace-nowrap">Status: <span className={permit.status ? statusClasses[permit.status] : ''}>{ permit.status }</span></div>
          {permit.approvedAt && <div className="whitespace-nowrap">Approved: { format(new Date(permit.approvedAt), 'MMM dd, yyyy') }</div>}
        </div>
        <div>
          {location.description && <div>Location: {location.description}</div>}
          {location.foodItems && <div>Food Items: {location.foodItems}</div>}
        </div>
      </div>
    </div>
  );
}
