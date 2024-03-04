import { SelectItem } from '@sharedTypes/components';
import kebabCase from 'lodash/kebabCase';
import DropdownItem from './item';

interface Props<T> {
  items: SelectItem<T>[];
  onSelect: (item: SelectItem<T>) => void;
  onClear: () => void;
}

export default function DropdownList<T>({ items, onSelect, onClear }: Props<T>) {
  return (
    <>
      {/* This is a hack, but I don't have time to do it better. */}
      <DropdownItem<undefined>
        item={{ label: 'Clear', value: undefined }}
        onSelect={onClear}
      />
      {items.map((item) => (
        <DropdownItem<T>
          key={item.key || kebabCase(item.label)}
          item={item}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
