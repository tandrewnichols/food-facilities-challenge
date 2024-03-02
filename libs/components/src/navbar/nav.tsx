import NavLink from './link';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default function Nav() {
  return (
    <div className="w-full flex justify-between items-center py-6 px-12 text-white bg-primary">
      <NavLink href="/">Food Facilities Challenge</NavLink>
      <NavLink href="/" icon={faUser}>Sign In</NavLink>
    </div>
  );
}
