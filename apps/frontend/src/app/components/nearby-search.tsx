'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@hooks/search';
import { SearchResponse } from '@sharedTypes/models';
import useGeolocation from 'beautiful-react-hooks/useGeolocation';
import Spinner from '@components/spinner';

interface Props {
  setResults: (results: SearchResponse[]) => void;
  setPending: (state: boolean) => void;
}

export default function NearbySearch({ setResults, setPending }: Props) {
  const [pending, setLocalPending] = useState<boolean>(false);
  const [geoState] = useGeolocation();
  const [performSearch, searchResults] = useSearch<SearchResponse>('nearby');

  useEffect(() => {
    if (geoState.isSupported && geoState.isRetrieving) {
      setPending(true);
      setLocalPending(true);
    }
  }, [geoState.isRetrieving]);

  useEffect(() => {
    if (geoState.position) {
      performSearch({
        latitude: geoState.position.coords.latitude,
        longitude: geoState.position.coords.longitude
      });
    }
  }, [geoState.position, performSearch, setPending]);

  useEffect(() => {
    setResults(searchResults);
    setPending(false);
    setLocalPending(false);
  }, [searchResults, setResults]);

  return (
    <div className="mx-auto w-full row-y space-x-2 pt-8">
      {pending && (
        <div className="w-full flex flex-col items-center justify-center space-y-4">
          <h3>Retrieving position. This might take some time.</h3>
          <Spinner />
        </div>
      )}
    </div>
  );
}

