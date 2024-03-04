import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { twMerge as merge } from 'tailwind-merge';

interface Props {
  className?: string;
}

export default function Spinner ({ className }: Props) {
  return (
    <Icon icon={faSpinner} spin className={clsx(merge('text-xl', className))} />
  );
}
