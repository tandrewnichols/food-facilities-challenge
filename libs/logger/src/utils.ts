import { AxiosError } from 'axios';

export const getDebugInfoFromAxios = (e: AxiosError) => {
  if (e.config) {
    const { params, method, baseURL, url: path, data: requestData, headers } = e.config || {};
    const url = `${ baseURL }${ path }`;

    const requestInfo = { url, method, params, headers, data: requestData };

    if (e.response) {
      const { data, status } = e.response;
      const responseHeaders = e.response.headers as Record<string, string>;

      return {
        request: requestInfo,
        response: { data, status, headers: responseHeaders },
      };
    } else if (e.request) {
      return {
        request: {
          ...requestInfo,
          socketErrored: e.request.socket?.errored?.toString() ?? '',
        },
      };
    } else {
      return { request: requestInfo };
    }
  }

  return null;
};
