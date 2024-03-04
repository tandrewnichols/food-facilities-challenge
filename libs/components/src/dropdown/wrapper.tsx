import { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface Props extends PropsWithChildren {
  dropdownId: string;
  className?: string;
}

export default function DropdownListWrapper({ dropdownId, className, children }: Props) {
  return (
    <ul
      id={dropdownId}
      role="listbox"
      className={clsx('border border-rounded bg-white mt-1 absolute z-10 overflow-y-auto w-max', className)}
    >
      {children}
    </ul>
  );
}
