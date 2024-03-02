import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import merge from 'lodash/merge';
import axios from 'axios';
// import { useToastContext } from '../context/toast-context';
import { useAbortableEffect, useToggle } from './utils';

export interface RequestConfig extends AxiosRequestConfig {
  initialPending?: boolean;
}

type VerbsWithBody = 'put' | 'post' | 'patch';
type VerbsWithoutBody = 'get' | 'delete';
type ApiCallResponse<Response> = [Response | null, AxiosResponse | null, Error | null];

export type HookWithBodyResponse<Body, Response = Body> = [
  (url: string, body: Partial<Body>, config?: AxiosRequestConfig) => Promise<ApiCallResponse<Response>>,
  Error | undefined,
  boolean,
];

export type HookWithoutBodyResponse<Response> = [
  (url: string, config?: AxiosRequestConfig) => Promise<ApiCallResponse<Response>>,
  Error | undefined,
  boolean,
];

export type HookWithBody = <Body, Response = Body>(config?: RequestConfig) => HookWithBodyResponse<Body, Response>;
export type HookWithoutBody = <Response>(config?: RequestConfig) => HookWithoutBodyResponse<Response>;

const makeApiHookWithBody = (verb : VerbsWithBody) => <Body, Response = Body>(config : RequestConfig = {}) : HookWithBodyResponse<Body, Response> => {
  const { ...requestConfig } = config;

  const [pending, setPending, unsetPending] = useToggle(false);
  const [error, setError] = useState<Error>();
  // const { showToast } = useToastContext();

  const makeApiCall = useCallback(async (url: string, body: Partial<Body>, axiosConfig: AxiosRequestConfig = {}): Promise<ApiCallResponse<Response>> => {
    setPending();

    const fullConfig = merge(requestConfig, axiosConfig);

    try {
      const response = await axios[verb](url, body, fullConfig);
      return [response.data, response, null];
    } catch (error) {
      const e = error as Error;
      if (error.name !== 'CanceledError' && !fullConfig.signal?.aborted) {
        setError(error);
        // showToast(error.message, 'danger');
      }
      return [null, null, error];
    } finally {
      if (!fullConfig.signal?.aborted) {
        unsetPending();
      }
    }
  }, [config]);

  return [makeApiCall, error, pending];
};

const makeApiHookWithoutBody = (verb : VerbsWithoutBody) => <Response>(config : RequestConfig = {}) : HookWithoutBodyResponse<Response> => {
  const { initialPending, ...requestConfig } = config;

  const [pending, setPending, unsetPending] = useToggle(initialPending || false);
  const [error, setError] = useState<Error>();
  // const { showToast } = useToastContext();

  const makeApiCall = useCallback(async (url: string, axiosConfig?: AxiosRequestConfig): Promise<ApiCallResponse<Response>> => {
    setPending();

    const fullConfig = merge(requestConfig, axiosConfig);

    try {
      const response = await axios[verb](url, fullConfig);
      return [response.data, response, null];
    } catch (error) {
      const e = error as Error;
      if (e.name !== 'CanceledError' && !fullConfig.signal?.aborted) {
        setError(e);
        // showToast(e.message, 'danger');
      }
      return [null, null, e];
    } finally {
      if (!fullConfig.signal?.aborted) {
        unsetPending();
      }
    }
  }, [config]);

  return [makeApiCall, error, pending];
};

export const useLazyGet = makeApiHookWithoutBody('get');

export type GetResponse<Response> = [
  Response | undefined,
  Error | undefined,
  boolean,
  Dispatch<SetStateAction<Response | undefined>>,
  AxiosResponse | null,
];

export function useGet<Response>(url : string, config : RequestConfig = {}) : GetResponse<Response> {
  /* eslint-disable-next-line no-param-reassign */
  config.initialPending ??= true;

  const [data, setData] = useState<Response | undefined>();
  const [response, setResponse] = useState<AxiosResponse | null>(null);
  const [makeApiCall, error, pending] = useLazyGet<Response>(config);

  useAbortableEffect(async (signal : AbortSignal) => {
    const [responseData, responseObject] = await makeApiCall(url, { signal });
    if (responseData && !signal.aborted) {
      setData(responseData);
      setResponse(responseObject);
    }
  }, []);

  return [data, error, pending, setData, response];
}

export const usePost = makeApiHookWithBody('post');
export const usePut = makeApiHookWithBody('put');
export const usePatch = makeApiHookWithBody('patch');

export const useDelete = makeApiHookWithoutBody('delete');

export default { useGet, useLazyGet, usePost, usePut, usePatch, useDelete };
