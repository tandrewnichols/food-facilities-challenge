'use client';

import { useEffect, useState } from 'react';
import TextInput from '@components/input/text';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useSearch } from '@hooks/search';
import { SearchResponse } from '@sharedTypes/models';

interface Props {
  setResults: (results: SearchResponse[]) => void;
}

export default function AddressSearch({ setResults }: Props) {
  const [search, setSearch] = useState<string>('');
  const [performSearch, searchResults] = useSearch<SearchResponse>('address');

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val: string = e.target.value;
    setSearch(val);

    if (val.length > 2) {
      performSearch({ query: val });
    } else {
      setResults([]);
    }
  };

  useEffect(() => {
    setResults(searchResults);
  }, [searchResults, setResults]);

  return (
    <div className="mx-auto w-full row-y space-x-2">
      <TextInput value={search} name="address" onChange={onChange} icon={faMagnifyingGlass} />
    </div>
  );
}

