import React from 'react';
import { useSearch } from './search';
import { shallow } from 'enzyme';
import { when } from 'jest-when';

jest.mock('@api/api');
import api from '@api/api';

jest.mock('lodash/debounce');
import debounce from 'lodash/debounce';

const wait = (millis: number) => new Promise((resolve) => setTimeout(resolve, millis));

describe('search', () => {
  let Component : React.FC;
  const InnerComponent = (props: any) => <div />;

  describe('useSearch', () => {
    beforeEach(() => {
      // Just bypass the actual debouncing for the test
      (debounce as jest.Mock).mockImplementation((fn) => fn);
      Component = () => {
        const [performSearch, results, pending, error] = useSearch<string>('suffix');

        return (
          <InnerComponent performSearch={performSearch} results={results} pending={pending} error={error} />
        );
      };
    });

    describe('everything is awesome', () => {
      beforeEach(() => {
        when(api.get)
          .calledWith('/search/suffix', { params: { foo: 'bar' }})
          .mockResolvedValue({ data: ['foo', 'bar'] });
      });

      it('should call the api', async () => {
        const component = shallow(<Component />);

        expect(component).toHaveProp({ results: [] });

        component.prop('performSearch')({ foo: 'bar' });

        expect(component).toHaveProp({ pending: true });

        await wait(0);

        expect(component).toHaveProp({ pending: false });
        expect(component).toHaveProp({ results: ['foo', 'bar'] });
      });
    });

    describe('an error from the api', () => {
      beforeEach(() => {
        when(api.get)
          .calledWith('/search/suffix', { params: { foo: 'bar' }})
          .mockRejectedValue(new Error('banana'));
      });

      it('should call the api and catch the error', async () => {
        const component = shallow(<Component />);

        component.prop('performSearch')({ foo: 'bar' });

        await wait(0);

        expect(component).toHaveProp({ error: expect.objectContaining({ message: 'banana' }) });
      });
    });
  });
});
