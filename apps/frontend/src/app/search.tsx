'use client';

import { useState } from 'react';
import Search from './components/search';
import { Candidate } from '@sharedTypes/models';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

export default function SearchWrapper() {
  const [results, setResults] = useState<Candidate[]>([]);

  return (
    <div className="full col-y">
      <Search<Candidate> setResults={setResults} name="candidate-name" />
      <div className="full col-y mt-8">
        {results.length ? (
          <div>results go here</div>
        ) : (
          <div className="col-xy space-y-4">
            <h3>Let's get started with a search</h3>
            <Icon icon={faMagnifyingGlass} className="fa-10x" />
          </div>
        )}
      </div>
    </div>
  );
}
