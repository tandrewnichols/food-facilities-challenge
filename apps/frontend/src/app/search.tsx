'use client';

import { useEffect, useState } from 'react';
import ApplicantSearch from './components/applicant-search';
import AddressSearch from './components/address-search';
import NearbySearch from './components/nearby-search';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Facility from './components/facility-result';
import { SearchMode } from '@sharedTypes/components';
import clsx from 'clsx';
import { SearchResponse } from '@sharedTypes/models';

export default function SearchWrapper() {
  const [results, setResults] = useState<SearchResponse[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const [mode, setMode] = useState<SearchMode>(SearchMode.APPLICANT);

  useEffect(() => {
    setResults([]);
  }, [mode, setResults]);

  return (
    <div className="h-full w-2/3 flex flex-col items-center mx-auto">
      <div className="flex w-full justify-end items-center space-x-2">
        <div className="font-bold">Mode:</div>
        {Object.entries(SearchMode).map(([key, val]: [string, SearchMode]) => (
          <button type="button" onClick={() => setMode(val)} key={val} className={clsx({ 'text-secondary': mode === val })}>
            {val}
          </button>
        ))}
      </div>
      {mode === SearchMode.APPLICANT && <ApplicantSearch setResults={setResults} />}
      {mode === SearchMode.ADDRESS && <AddressSearch setResults={setResults} />}
      {mode === SearchMode.NEARBY && <NearbySearch setResults={setResults} setPending={setPending} />}
      {!pending && (
        <div className="full flex flex-col items-center  mt-8">
          {results.length ? (
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              {results.map(({ facility, location, permit }) => (
                <Facility key={`${ facility.id }-${ location.id }-${ permit.id }`} facility={facility} location={location} permit={permit} />
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              <h3>Let's get started with a search</h3>
              <Icon icon={faMagnifyingGlass} className="fa-10x" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
