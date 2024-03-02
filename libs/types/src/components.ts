export interface SelectItem<T> {
  label: string;
  value: T;
  key?: string;
  disabled?: boolean;
}

export enum Keys {
  ARROW_DOWN = 'ArrowDown',
  ARROW_UP = 'ArrowUp',
  ENTER = 'Enter',
  ESC = 'Escape',
  TAB = 'Tab'
}
