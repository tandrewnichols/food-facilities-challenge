import { MouseEvent } from 'react';
import { SelectItem } from '@sharedTypes/components';

interface Props<T> {
  item: SelectItem<T>;
  onSelect: (val: SelectItem<T>) => void;
}

export default function DropdownItem<T>({ item, onSelect }: Props<T>) {
  const handleSelect = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSelect(item);
  };

  return (
    <li role="option" aria-label={item.label} className="w-full">
      <button type="button" onClick={handleSelect} className="block w-full text-left py-1 px-4 hover:text-white hover:bg-primary">
        {item.label}
      </button>
    </li>
  );
}
