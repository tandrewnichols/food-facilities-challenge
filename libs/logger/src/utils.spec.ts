import { getDebugInfoFromAxios } from './utils';
import { AxiosError } from 'axios';

const makeError = (props: unknown) => Object.assign(new AxiosError('Banana'), props);

describe('utils', () => {
  describe('.getDebugInfoFromAxios', () => {
    describe('with a config and response', () => {
      it('should return response properties', () => {
        expect(getDebugInfoFromAxios(makeError({
          config: {
            params: 'params',
            method: 'method',
            baseURL: 'base',
            url: 'url',
            data: 'data',
            headers: 'headers'
          },
          response: {
            data: 'response data',
            status: 'status',
            headers: {
              foo: 'bar'
            }
          }
        }))).toEqual({
          request: {
            params: 'params',
            method: 'method',
            url: 'baseurl',
            data: 'data',
            headers: 'headers'
          },
          response: {
            data: 'response data',
            status: 'status',
            headers: {
              foo: 'bar'
            }
          }
        });
      });
    });

    describe('with a config and request', () => {
      it('should return request properties', () => {
        expect(getDebugInfoFromAxios(makeError({
          config: {
            params: 'params',
            method: 'method',
            baseURL: 'base',
            url: 'url',
            data: 'data',
            headers: 'headers'
          },
          request: {
            socket: {
              errored: 12
            }
          }
        }))).toEqual({
          request: {
            params: 'params',
            method: 'method',
            url: 'baseurl',
            data: 'data',
            headers: 'headers',
            socketErrored: '12'
          },
        });
      });
    });

    describe('with a config and no response or request', () => {
      it('should return request properties', () => {
        expect(getDebugInfoFromAxios(makeError({
          config: {
            params: 'params',
            method: 'method',
            baseURL: 'base',
            url: 'url',
            data: 'data',
            headers: 'headers'
          },
        }))).toEqual({
          request: {
            params: 'params',
            method: 'method',
            url: 'baseurl',
            data: 'data',
            headers: 'headers',
          },
        });
      });
    });

    describe('with no config', () => {
      it('should return null', () => {
        expect(getDebugInfoFromAxios(makeError({}))).toEqual(null);
      });
    });
  });
});
