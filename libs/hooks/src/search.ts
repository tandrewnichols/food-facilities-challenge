import { useState, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { AxiosRequestConfig } from 'axios';
import api from '@api/api';

type SearchReturn<T> = [
  (params: AxiosRequestConfig['params']) => void,
  T[],
  boolean,
  Error | undefined
];

// Not strictly necessary to make this generic, since all the
// search endpoints return the same structure, but it allows
// this function to be more generic (no pun intended) for
// future consumption.
export const useSearch = <T>(suffix: string): SearchReturn<T> => {
  const [results, setResults] = useState<T[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const debounceChange = useMemo(() => debounce(async (params: AxiosRequestConfig['params']) => {
    setPending(true);
    try {
      const { data: results } = await api.get<T[]>(`/search/${ suffix }`, { params });
      setResults(results);
    } catch (e) {
      setError(e as Error);
    } finally {
      setPending(false);
    }
  }, 300), [setResults, suffix, setError, setPending]);

  return [debounceChange, results, pending, error];
};
