import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import NearbySearch from './nearby-search';
import { when } from 'jest-when';

jest.mock('@hooks/search');
import { useSearch } from '@hooks/search';

jest.mock('beautiful-react-hooks/useGeolocation');
import useGeolocation from 'beautiful-react-hooks/useGeolocation';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn()
}));

describe('app/components/nearby-search', () => {
  let setResults: jest.Mock;
  let setPending: jest.Mock;
  let performSearch: jest.Mock;
  let effectFns: (() => void)[];

  beforeEach(() => {
    effectFns = [];
    setResults = jest.fn();
    setPending = jest.fn();
    performSearch = jest.fn();

    (useEffect as jest.Mock).mockImplementation((fn) => {
      effectFns.push(fn);
    });

    when(useSearch as jest.Mock)
      .calledWith('nearby')
      .mockReturnValue([performSearch, ['a', 'b']]);
  });

  describe('useEffect: supported and retrieving', () => {
    beforeEach(() => {
      (useGeolocation as jest.Mock).mockReturnValue([{ isSupported: true, isRetrieving: true }]);
    });

    it('set pending to true', () => {
      const component = shallow(<NearbySearch setResults={setResults} setPending={setPending} />);
      expect(component.find('h3')).toHaveLength(0);

      effectFns[0]();
      expect(setPending).toHaveBeenCalledWith(true);
      expect(component.find('h3')).toHaveLength(1);
    });
  });

  describe('useEffect: position', () => {
    beforeEach(() => {
      (useGeolocation as jest.Mock).mockReturnValue([
        {
          position: {
            coords: {
              latitude: 123,
              longitude: 456
            }
          }
        }
      ]);
    });

    it('should perform a search', () => {
      shallow(<NearbySearch setResults={setResults} setPending={setPending} />);

      effectFns[1]();
      expect(performSearch).toHaveBeenCalledWith({
        latitude: 123,
        longitude: 456
      });
    });
  });

  describe('useEffect: results', () => {
    beforeEach(() => {
      (useGeolocation as jest.Mock).mockReturnValue([{ isSupported: true, isRetrieving: true }]);
    });

    it('should set pending to false', () => {
      const component = shallow(<NearbySearch setResults={setResults} setPending={setPending} />);
      expect(component.find('h3')).toHaveLength(0);

      effectFns[0]();
      expect(component.find('h3')).toHaveLength(1);

      effectFns[2]();
      expect(setResults).toHaveBeenCalledWith(['a', 'b']);
      expect(setPending).toHaveBeenCalledWith(false);
      expect(component.find('h3')).toHaveLength(0);
    });
  });
});
