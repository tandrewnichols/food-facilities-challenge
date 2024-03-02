import React from 'react';
import { shallow } from 'enzyme';
import { wait } from '@helpers/utils';
import { when } from 'jest-when';
import { useAuth } from '@clerk/nextjs';
import { useApi, useDefaultGateway } from '../context/config-context';
import { useAbortableEffect } from './utils';
import { useToastContext } from '../context/toast-context';
import { useGet, useLazyGet, usePut, usePost, usePatch, useDelete, HookWithBody, HookWithoutBody } from './api';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  useAbortableEffect: jest.fn(),
}));

jest.mock('../context/config-context');
jest.mock('../context/toast-context');
jest.mock('@clerk/nextjs');

describe('hooks/api', () => {
  let Component : React.FC;
  const InnerComponent = (props) => <div />;
  let effectFn : (signal: AbortSignal) => Promise<() => void>;
  let showToast : jest.Mock;
  let getToken : jest.Mock;
  let api : {
    [x : string]: jest.Mock;
  };

  beforeEach(() => {
    api = {
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    (useDefaultGateway as jest.Mock).mockReturnValue({
      defaultGateway: 'fan',
    });

    showToast = jest.fn();
    (useToastContext as jest.Mock).mockReturnValue({ showToast });
    (useApi as jest.Mock).mockReturnValue(api);

    getToken = jest.fn().mockResolvedValue('token');
    (useAuth as jest.Mock).mockReturnValue({ userId: 'banana', getToken });

    (useAbortableEffect as jest.Mock).mockImplementation((fn) => {
      effectFn = fn;
    });
  });

  describe('useGet', () => {
    describe('initial render - initialPending is undefined', () => {
      beforeEach(() => {
        Component = () => {
          const [data, error, pending] = useGet('/foo/bar');

          return (
            <InnerComponent data={data} error={error} pending={pending} />
          );
        };
      });

      it('should default to true', () => {
        const component = shallow(<Component />);
        expect(component.prop('data')).toBeUndefined();
        expect(component.prop('error')).toBeUndefined();
        expect(component.prop('pending')).toBe(true);
      });
    });

    describe('initial render - initialPending is true', () => {
      beforeEach(() => {
        Component = () => {
          const [data, error, pending] = useGet('/foo/bar', { initialPending: true });

          return (
            <InnerComponent data={data} error={error} pending={pending} />
          );
        };
      });

      it('should use the passed value', () => {
        const component = shallow(<Component />);
        expect(component.prop('data')).toBeUndefined();
        expect(component.prop('error')).toBeUndefined();
        expect(component.prop('pending')).toBe(true);
      });
    });

    describe('on success', () => {
      beforeEach(() => {
        when(api.get)
          .calledWith('/foo/bar', {
            signal: 'signal',
            headers: {
              Authorization: 'Bearer token',
            },
          })
          .mockResolvedValue({
            data: 'data',
          });

        Component = () => {
          const [data, error, pending] = useGet('/foo/bar', { initialPending: true });

          return (
            <InnerComponent data={data} error={error} pending={pending} />
          );
        };
      });

      it('should have data', async () => {
        const component = shallow(<Component />);
        effectFn('signal' as unknown as AbortSignal);

        expect(component.prop('data')).toBeUndefined();
        expect(component.prop('error')).toBeUndefined();
        expect(component.prop('pending')).toBe(true);

        await wait(0);

        expect(component.prop('data')).toBe('data');
        expect(component.prop('error')).toBeUndefined();
        expect(component.prop('pending')).toBe(false);
      });
    });

    describe('on error - because of aborting', () => {
      beforeEach(() => {
        class CanceledError extends Error {
          constructor() {
            super();
            this.name = 'CanceledError';
          }
        }

        when(api.get)
          .calledWith('/foo/bar', {
            signal: 'signal',
            headers: {
              Authorization: 'Bearer token',
            },
          })
          .mockRejectedValue(new CanceledError());

        Component = () => {
          const [data, error, pending] = useGet('/foo/bar', { initialPending: true });

          return (
            <InnerComponent data={data} error={error} pending={pending} />
          );
        };
      });

      it('should not set error', async () => {
        const component = shallow(<Component />);
        effectFn('signal' as unknown as AbortSignal);

        expect(component.prop('data')).toBeUndefined();
        expect(component.prop('error')).toBeUndefined();
        expect(component.prop('pending')).toBe(true);

        await wait(0);

        expect(component.prop('data')).toBeUndefined();
        expect(component.prop('error')).toBeUndefined();
        expect(component.prop('pending')).toBe(false);
        expect(showToast).not.toHaveBeenCalled();
      });
    });

    describe('on error - because of a failed request', () => {
      beforeEach(() => {
        when(api.get)
          .calledWith('/foo/bar', {
            signal: 'signal',
            headers: {
              Authorization: 'Bearer token',
            },
          })
          .mockRejectedValue(new Error('banana'));

        Component = () => {
          const [data, error, pending] = useGet('/foo/bar', { initialPending: true });

          return (
            <InnerComponent data={data} error={error} pending={pending} />
          );
        };
      });

      it('should set error', async () => {
        const component = shallow(<Component />);
        effectFn('signal' as unknown as AbortSignal);

        expect(component.prop('data')).toBeUndefined();
        expect(component.prop('error')).toBeUndefined();
        expect(component.prop('pending')).toBe(true);

        await wait(0);

        expect(component.prop('data')).toBeUndefined();
        expect(component.prop('error')).toBeInstanceOf(Error);
        expect(component.prop('error').message).toBe('banana');
        expect(component.prop('pending')).toBe(false);
        expect(showToast).toHaveBeenCalledWith('banana', 'danger');
      });
    });

    describe('api is not defined yet', () => {
      beforeEach(() => {
        (useApi as jest.Mock).mockImplementation(() => {});
        Component = () => {
          const [data, error, pending] = useGet('/foo/bar', { initialPending: true });

          return (
            <InnerComponent data={data} error={error} pending={pending} />
          );
        };
      });

      it('should not call makeApiCall', async () => {
        shallow(<Component />);

        await effectFn({} as AbortSignal);

        expect(api.get).not.toHaveBeenCalled();
      });
    });
  });

  describe.each([
    ['useLazyGet', useLazyGet, 'get'],
    ['useDelete', useDelete, 'delete'],
  ])('%s', (message : string, useRequestHook : HookWithoutBody, verb : string) => {
    describe('success', () => {
      beforeEach(() => {
        when(api[verb])
          .calledWith('/foo', {
            headers: {
              Authorization: 'Bearer token',
            },
          })
          .mockResolvedValue({ data: 'data' });

        Component = () => {
          const [makeApiCall, error, pending] = useRequestHook();

          return (
            <InnerComponent makeApiCall={makeApiCall} error={error} pending={pending} />
          );
        };
      });

      it('should return data', async () => {
        const component = shallow(<Component />);

        const makeApiCall = component.prop('makeApiCall');

        await expect(makeApiCall('/foo')).resolves.toEqual(['data', { data: 'data' }, null]);
      });
    });

    describe('error', () => {
      let e : Error;

      beforeEach(() => {
        e = new Error('banana');

        when(api[verb])
          .calledWith('/foo', {
            headers: {
              Authorization: 'Bearer token',
            },
          })
          .mockRejectedValue(e);

        Component = () => {
          const [makeApiCall, error, pending] = useRequestHook();

          return (
            <InnerComponent makeApiCall={makeApiCall} error={error} pending={pending} />
          );
        };
      });

      it('should return data', async () => {
        const component = shallow(<Component />);

        const makeApiCall = component.prop('makeApiCall');

        const promise = makeApiCall('/foo');

        expect(component.prop('pending')).toBe(true);

        const response = await promise;

        expect(component.prop('pending')).toBe(false);

        expect(component.prop('error')).toEqual(e);
        expect(response).toEqual([null, null, e]);
        expect(showToast).toHaveBeenCalledWith('banana', 'danger');
      });
    });
  });

  describe.each([
    ['usePut', usePut, 'put'],
    ['usePost', usePost, 'post'],
    ['usePatch', usePatch, 'patch'],
  ])('%s', (message : string, useRequestHook : HookWithBody, verb : string) => {
    describe('success', () => {
      beforeEach(() => {
        when(api[verb])
          .calledWith('/', { foo: 'bar' }, {
            headers: {
              Authorization: 'Bearer token',
            },
          })
          .mockResolvedValue({ data: 'data' });

        Component = () => {
          const [makeApiCall, error, pending] = useRequestHook();

          return (
            <InnerComponent makeApiCall={makeApiCall} error={error} pending={pending} />
          );
        };
      });

      it('should return data', async () => {
        const component = shallow(<Component />);

        const makeApiCall = component.prop('makeApiCall');

        await expect(makeApiCall('/', { foo: 'bar' })).resolves.toEqual(['data', { data: 'data' }, null]);
      });
    });

    describe('error', () => {
      let e : Error;

      beforeEach(() => {
        e = new Error('banana');

        when(api[verb])
          .calledWith('/', { foo: 'bar' }, {
            headers: {
              Authorization: 'Bearer token',
            },
          })
          .mockRejectedValue(e);

        Component = () => {
          const [makeApiCall, error, pending] = useRequestHook();

          return (
            <InnerComponent makeApiCall={makeApiCall} error={error} pending={pending} />
          );
        };
      });

      it('should return data', async () => {
        const component = shallow(<Component />);

        const makeApiCall = component.prop('makeApiCall');

        const promise = makeApiCall('/', { foo: 'bar' });

        expect(component.prop('pending')).toBe(true);

        const response = await promise;

        expect(component.prop('pending')).toBe(false);

        expect(component.prop('error')).toEqual(e);
        expect(response).toEqual([null, null, e]);
        expect(showToast).toHaveBeenCalledWith('banana', 'danger');
      });
    });
  });
});
