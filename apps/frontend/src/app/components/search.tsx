'use client';

import TextInput from '@components/input/text';
import { useFieldState } from '@hooks/forms';

export default function Search() {
  const [search, setSearch] = useFieldState('');

  return (
    <div className="mx-auto w-2/3">
      <TextInput value={search} name="Search" onChange={setSearch} />
    </div>
  );
}
