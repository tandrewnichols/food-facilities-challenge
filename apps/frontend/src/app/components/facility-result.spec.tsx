import React from 'react';
import { shallow } from 'enzyme';
import FacilityResult from './facility-result';
import { FacilityType , Facility as FacilityObj, Location, Permit, PermitStatus } from '@sharedTypes/models';
import { format } from 'date-fns';

const now = new Date();

describe('app/components/facility-result', () => {
  describe('with optional properties present', () => {
    it('should render a search result', () => {
      const facility = {
        applicant: 'applicant',
        type: FacilityType.TRUCK
      } as FacilityObj;

      const location = {
        address: 'address',
        description: 'description',
        foodItems: 'foodItems'
      } as Location;

      const permit = {
        permit: 'permit',
        status: PermitStatus.APPROVED,
        approvedAt: now.toString()
      } as Permit;

      const component = shallow(<FacilityResult facility={facility} location={location} permit={permit} />);

      expect(component.find('[data-test="applicant"]')).toHaveText('applicant ');
      expect(component.find('[data-test="type"]')).toHaveText(`(${ FacilityType.TRUCK })`);
      expect(component.find('[data-test="address"]')).toHaveText('address');
      expect(component.find('[data-test="permit"]')).toHaveText('Permit: permit');
      expect(component.find('[data-test="status"]')).toHaveText(PermitStatus.APPROVED);
      expect(component.find('[data-test="status"]')).toHaveClassName('text-success');
      expect(component.find('[data-test="approved"]')).toHaveText(`Approved: ${ format(now, 'MMM dd, yyyy') }`);
      expect(component.find('[data-test="location-description"]')).toHaveText('Location: description');
      expect(component.find('[data-test="food-items"]')).toHaveText('Food Items: foodItems');
    });
  });

  describe('with optional properties missing', () => {
    it('should render a search result with less information', () => {
      const facility = {
        applicant: 'applicant',
      } as FacilityObj;

      const location = {
        address: 'address',
      } as Location;

      const permit = {
        permit: 'permit',
        status: PermitStatus.APPROVED,
      } as Permit;

      const component = shallow(<FacilityResult facility={facility} location={location} permit={permit} />);

      expect(component.find('[data-test="applicant"]')).toHaveText('applicant ');
      expect(component.find('[data-test="type"]')).toHaveLength(0);
      expect(component.find('[data-test="address"]')).toHaveText('address');
      expect(component.find('[data-test="permit"]')).toHaveText('Permit: permit');
      expect(component.find('[data-test="status"]')).toHaveText(PermitStatus.APPROVED);
      expect(component.find('[data-test="status"]')).toHaveClassName('text-success');
      expect(component.find('[data-test="approved"]')).toHaveLength(0);
      expect(component.find('[data-test="location-description"]')).toHaveLength(0);
      expect(component.find('[data-test="food-items"]')).toHaveLength(0);
    });
  });
});
