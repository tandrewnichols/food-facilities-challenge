'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Props extends React.PropsWithChildren {
  href: string;
  icon?: IconDefinition;
  className?: string;
}

export default function NavLink({ href, icon, className, children }: Props) {
  const pathname = usePathname();

  return (
    <Link href={href} className={clsx('space-x-2', className, {
      'text-white': pathname === href,
    })}>
      {icon && <Icon icon={icon} />}
      <span>{children}</span>
    </Link>
  );
}
