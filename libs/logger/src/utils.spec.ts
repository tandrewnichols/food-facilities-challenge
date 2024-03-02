import { getDebugInfoFromYup } from './utils';
import { ValidationError } from 'yup';

describe('lib/yup', () => {
  describe('getDebugInfoFromError', () => {
    it('should return a subset of info from the error', () => {
      const error = {
        value: 'value',
        path: 'path',
        errors: 'errors',
        inner: 'inner',
        params: 'params'
      };

      expect(getDebugInfoFromYup({ ...error, extra: true } as unknown as ValidationError)).toEqual(error);
    });
  });
});
