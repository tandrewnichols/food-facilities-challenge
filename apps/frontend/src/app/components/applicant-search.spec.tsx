import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import ApplicantSearch from './applicant-search';
import { PermitStatus  } from '@sharedTypes/models';
import { when } from 'jest-when';

jest.mock('@hooks/search');
import { useSearch } from '@hooks/search';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn()
}));

describe('app/components/applicant-search', () => {
  let setResults: jest.Mock;
  let performSearch: jest.Mock;
  let effectFn: () => void;

  beforeEach(() => {
    setResults = jest.fn();
    performSearch = jest.fn();

    (useEffect as jest.Mock).mockImplementation((fn) => {
      effectFn = fn;
    });

    when(useSearch as jest.Mock)
      .calledWith('applicant')
      .mockReturnValue([performSearch, ['a', 'b']]);
  });

  describe('onChnage', () => {
    describe('with a value longer than 3 characters', () => {
      it('should perform a search', () => {
        const component = shallow(<ApplicantSearch setResults={setResults} />);

        component.find('TextInput').prop('onChange')?.({
          target: {
            value: 'value'
          }
        } as React.ChangeEvent<HTMLInputElement>);

        expect(component.find('TextInput')).toHaveProp({ value: 'value' });
        expect(performSearch).toHaveBeenCalledWith({ query: 'value' });
        expect(setResults).not.toHaveBeenCalled();
      });
    });

    describe('with a value less than 3 characters', () => {
      it('should call performSearch', () => {
        const component = shallow(<ApplicantSearch setResults={setResults} />);

        component.find('TextInput').prop('onChange')?.({
          target: {
            value: 'va'
          }
        } as React.ChangeEvent<HTMLInputElement>);

        expect(component.find('TextInput')).toHaveProp({ value: 'va' });
        expect(performSearch).not.toHaveBeenCalledWith();
        expect(setResults).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('onStatusChange', () => {
    it('should perform a search', () => {
      const component = shallow(<ApplicantSearch setResults={setResults} />);

      const onSelect = component.find('Dropdown').prop('onSelect') as unknown as (status: PermitStatus) => void;
      onSelect(PermitStatus.APPROVED);
      expect(component.find('Dropdown')).toHaveProp({ value: PermitStatus.APPROVED });
      expect(performSearch).toHaveBeenCalledWith({ query: '', status: PermitStatus.APPROVED });
    });
  });

  describe('onClear', () => {
    describe('with search length greater than 3', () => {
      it('should clear status and perform a search', () => {
        const component = shallow(<ApplicantSearch setResults={setResults} />);

        component.find('TextInput').prop('onChange')?.({
          target: {
            value: 'value'
          }
        } as React.ChangeEvent<HTMLInputElement>);

        performSearch.mockReset();

        const onClear = component.find('Dropdown').prop('onClear') as unknown as () => void;
        onClear();

        expect(performSearch).toHaveBeenCalledWith({ query: 'value' });
        expect(setResults).not.toHaveBeenCalled();
      });
    });

    describe('with search length less than 3', () => {
      it('should clear status and perform a search', () => {
        const component = shallow(<ApplicantSearch setResults={setResults} />);

        const onClear = component.find('Dropdown').prop('onClear') as unknown as () => void;
        onClear();

        expect(performSearch).not.toHaveBeenCalled();
        expect(setResults).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('useMemo', () => {
    it('should map permit status to select items', () => {
      const component = shallow(<ApplicantSearch setResults={setResults} />);
      expect(component.find('Dropdown')).toHaveProp({
        items: [
          { label: 'APPROVED', value: 'APPROVED' },
          { label: 'REQUESTED', value: 'REQUESTED' },
          { label: 'EXPIRED', value: 'EXPIRED' },
          { label: 'ISSUED', value: 'ISSUED' },
          { label: 'SUSPEND', value: 'SUSPEND' },
        ]
      });
    });
  });

  describe('useEffect', () => {
    it('should call setResults', () => {
      shallow(<ApplicantSearch setResults={setResults} />);

      effectFn();

      expect(setResults).toHaveBeenCalledWith(['a', 'b']);
    });
  });
});
