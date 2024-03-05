import clsx from 'clsx';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import startCase from 'lodash/startCase';
import { useInOutTransition } from '@hooks/utils';

interface Props extends React.ComponentPropsWithoutRef<'input'> {
  icon?: IconDefinition;
  label?: string | false;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({
  value,
  name,
  className,
  disabled,
  onFocus,
  onBlur,
  onChange,
  icon,
  label = startCase(name),
}: Props) {
  const [
    { entering, startEntering },
    { startExiting },
    { entered }
  ] = useInOutTransition(75);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!entered) {
      startEntering();
    }

    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!value && (entered || entering)) {
      startExiting();
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="relative w-full py-3">
      {label && (
        <div className="absolute pointer-events-none row-y inset-y-0 pl-4 space-x-2.5">
          <label
            htmlFor={name}
            className={clsx('transition-[fontSize,transform] delay-0 duration-75 whitespace-nowrap', {
              'text-gray-800': !disabled,
              'text-gray-300': disabled,
              'translate-y-0 leading-6 text-base': !entered && !value,
              '-translate-y-2.5 leading-3 text-2xs text-primary': entered || value
            })}
          >{label}</label>
        </div>
      )}
      <input
        disabled={disabled}
        value={value}
        type="text"
        name={name}
        className={clsx('form-control pl-4', {
          'bg-gray-light': disabled,
          'pt-4 pb-1': label
        }, className)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={onChange}
        data-test={`${ name }-input`}
      />
      {icon && (
        <div className="absolute pointer-events-none row-y inset-y-0 right-0 pr-4">
          <Icon icon={icon} className="text-gray-800" />
        </div>
      )}
    </div>
  );
}
