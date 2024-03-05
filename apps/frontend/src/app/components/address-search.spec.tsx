import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import AddressSearch from './address-search';
import { when } from 'jest-when';

jest.mock('@hooks/search');
import { useSearch } from '@hooks/search';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn()
}));

describe('app/components/address-search', () => {
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
      .calledWith('address')
      .mockReturnValue([performSearch, ['a', 'b']]);
  });

  describe('onChange', () => {
    describe('with a value longer than 3 characters', () => {
      it('should perform a search', () => {
        const component = shallow(<AddressSearch setResults={setResults} />);
        
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
        const component = shallow(<AddressSearch setResults={setResults} />);
        
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

  describe('useEffect', () => {
    it('should call setResults', () => {
      shallow(<AddressSearch setResults={setResults} />);

      effectFn();

      expect(setResults).toHaveBeenCalledWith(['a', 'b']);
    });
  });
});
