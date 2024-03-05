import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
} from 'react';
import { SelectItem, Keys } from '@sharedTypes/components';

export function useFieldState(initialState = ''): [string, ChangeEventHandler<HTMLInputElement>, Dispatch<SetStateAction<string>>] {
  const [state, setState] = useState<string>(initialState);
  return [
    state,
    useCallback((e) => setState(e.target.value), [state]),
    setState,
  ];
}

export function useCheckboxState(initialState = false): [boolean, ChangeEventHandler<HTMLInputElement>, Dispatch<SetStateAction<boolean>>] {
  const [state, setState] = useState<boolean>(initialState);
  return [
    state,
    useCallback((e) => setState(e.target.checked), [state]),
    setState,
  ];
}

export function useArrowSelection<T>(list: SelectItem<T>[], onSelect: (selected: SelectItem<T>) => void, close: () => void): [number, KeyboardEventHandler<HTMLInputElement>] {
  const [index, setIndex] = useState<number>(-1);
  const [selected, setSelected] = useState<SelectItem<T>>();

  useEffect(() => {
    setIndex(-1);
  }, [list]);

  useEffect(() => {
    if (selected) {
      onSelect(selected);
    }
  }, [selected]);

  const handleArrows = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === Keys.ARROW_UP || (e.key === Keys.TAB && e.shiftKey)) {
        e.preventDefault();
        // up arrow
        if (index === -1) {
          // Shift tab from first element should close the list
          // and move to the previous tabindex
          if (e.key === Keys.TAB) {
            close();
          } else {
            setIndex(list.length - 1);
          }
        } else {
          setIndex(index - 1);
        }
      } else if (e.key === Keys.ARROW_DOWN || e.key === Keys.TAB) {
        // down arrow
        if (index === list.length - 1) {
          // Tab from the last element should close the list
          // and move to the next tabindex
          if (e.key === Keys.TAB) {
            close();
          } else {
            e.preventDefault();
            setIndex(-1);
          }
        } else {
          e.preventDefault();
          setIndex(index + 1);
        }
      } else if (e.key === Keys.ENTER && index > -1) {
        // If enter is pressed while on a result,
        // submit that result (rather than generically
        // what's in the search box)
        e.preventDefault();
        setSelected(list[index]);
      } else if (e.key === Keys.ESC) {
        e.preventDefault();
        close();
      }
    },
    [index, list],
  );

  return [index, handleArrows];
}

export default { useFieldState, useArrowSelection };
