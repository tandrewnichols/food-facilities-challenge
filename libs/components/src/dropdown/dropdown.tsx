import { useState, useEffect, useRef, KeyboardEvent, MouseEvent } from 'react';
import { SelectItem } from '@sharedTypes/components';
import useOnClickOutside from 'use-onclickoutside';
import { useToggle } from '@hooks/utils';
import { Keys } from '@sharedTypes/components';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DropdownListWrapper from './wrapper';
import DropdownList from './list';

interface Props<T> {
  name: string;
  items: SelectItem<T>[];
  value?: string;
  placeholder: string;
  onSelect: (item: T) => void;
  onClear: () => void;
  icon?: IconDefinition;
}

export default function Dropdown<T>({ name, items, value, onSelect, icon, placeholder, onClear }: Props<T>) {
  const [dropdownShowing, openDropdown, closeDropdown, toggleDropdown] = useToggle();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string>('');

  const handleSelect = (item: SelectItem<T>) => {
    setSelected(item.label);
    onSelect(item.value);
    closeDropdown();
  };

  const handleClear = () => {
    setSelected('');
    onClear();
    closeDropdown();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case Keys.ENTER:
        e.preventDefault();
        openDropdown();
        break;
      case Keys.ESC:
        e.preventDefault();
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleDropdown();
  };

  useEffect(() => {
    if (typeof value === 'string') {
      setSelected(value);
    }
  }, [value]);

  useOnClickOutside(dropdownRef, closeDropdown);

  const dropdownId = `${ name }-dropdown-list`;

  return (
    <div className="relative w-max" ref={dropdownRef}>
      <button
        type="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className="flex justify-center items-center content-center rounded py-2.5 px-4 cursor-pointer border border-gray-300"
      >
        {icon && (
          <Icon icon={icon} className="mr-0.5" />
        )}
        <div
          className="outline-none cursor-pointer"
          role="combobox"
          aria-controls={dropdownId}
          aria-expanded={dropdownShowing}
          aria-label={`${ name } dropdown list`}
        >
          {selected || placeholder}
        </div>
        <div className="row-y">
          <Icon className="w-4.5 mb-0 ml-1" icon={faAngleDown} />
        </div>
      </button>
      {dropdownShowing && (
        <DropdownListWrapper dropdownId={dropdownId}>
          <DropdownList<T> items={items} onSelect={handleSelect} onClear={handleClear} />
        </DropdownListWrapper>
      )}
    </div>
  );
}
