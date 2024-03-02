'use client';

import { useState, useMemo } from 'react';
import TextInput from '@components/input/text';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import debounce from 'lodash/debounce';
import api from '@api/api';

interface Props<T> {
  setResults: (results: T[]) => void;
  name: string;
}

export default function Search<T>({ setResults, name }: Props<T>) {
  const [search, setSearch] = useState<string>('');

  const debounceChange = useMemo(() => debounce(async (val: string) => {
    const { data: results } = await api.get<T[]>('/search', { params: { candidate: val }});
    setResults(results);
  }), [setResults]);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val: string = e.target.value;
    setSearch(val);

    if (val.length > 2) {
      debounceChange(val);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="mx-auto w-2/3">
      <TextInput value={search} name={name} onChange={onChange} icon={faMagnifyingGlass} />
    </div>
  );
}
