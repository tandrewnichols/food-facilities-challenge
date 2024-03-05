'use client';

import { useEffect, useState, useMemo } from 'react';
import TextInput from '@components/input/text';
import Dropdown from '@components/dropdown/dropdown';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { PermitStatus, SearchResponse  } from '@sharedTypes/models';
import { SelectItem } from '@sharedTypes/components';
import { useSearch } from '@hooks/search';

interface Props {
  setResults: (results: SearchResponse[]) => void;
}

export default function ApplicantSearch({ setResults }: Props) {
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<PermitStatus>();
  const [performSearch, searchResults] = useSearch<SearchResponse>('applicant');

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val: string = e.target.value;
    setSearch(val);

    if (val.length > 2) {
      performSearch({ query: val, status });
    } else {
      setResults([]);
    }
  };

  const onStatusChange = (newStatus: PermitStatus) => {
    setStatus(newStatus);
    performSearch({ query: search, status: newStatus });
  };

  const onClear = () => {
    setStatus(undefined);

    if (search.length > 2) {
      performSearch({ query: search });
    } else {
      setResults([]);
    }
  };

  const items = useMemo(() => {
    const initial: SelectItem<PermitStatus>[] = [];
    return Object.values(PermitStatus).reduce((memo, val) => memo.concat({ label: val, value: val }), initial);
  }, []);

  useEffect(() => {
    setResults(searchResults);
  }, [searchResults, setResults]);

  return (
    <div className="mx-auto w-full row-y space-x-2">
      <TextInput value={search} name="applicant" onChange={onChange} icon={faMagnifyingGlass} />
      <Dropdown<PermitStatus>
        value={status}
        name="status"
        items={items}
        placeholder="Status"
        onSelect={onStatusChange}
        onClear={onClear}
      />
    </div>
  );
}
