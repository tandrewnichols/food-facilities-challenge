import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
  MouseEventHandler,
  EffectCallback,
} from 'react';
import merge from 'lodash/merge';
import { OptionalCallbackFn, VoidFn } from '@sharedTypes/functions';

export function useHover(initialState = false) : [boolean, MouseEventHandler, MouseEventHandler] {
  const [hovering, setHover] = useState(initialState);

  return [
    hovering,
    useCallback(() => setHover(true), [hovering]),
    useCallback(() => setHover(false), [hovering]),
  ];
}

export function useToggle(initialState = false) : [
  boolean,
  VoidFn,
  VoidFn,
  VoidFn,
  Dispatch<SetStateAction<boolean>>,
] {
  const [toggle, setToggle] = useState(initialState);
  const on = useCallback(() => setToggle(true), [toggle]);
  const off = useCallback(() => setToggle(false), [toggle]);
  const change = useCallback(() => setToggle(!toggle), [toggle]);

  return [toggle, on, off, change, setToggle];
}

export function useMergeState<T>(initial: T): [T, (n: unknown) => void] {
  const [state, setState] = useState<T>(initial);
  const mergeState = useCallback(
    (newState: unknown) => setState((currentState) => merge({}, currentState, newState)),
    [state],
  );

  return [state, mergeState];
}

export function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

const DEFAULT_TRANSITION_TIME = 150;

type InOutTransitionReturn = [
  { entering: boolean, startEntering: OptionalCallbackFn, stopEntering: VoidFn },
  { exiting: boolean, startExiting: OptionalCallbackFn, stopExiting: VoidFn },
  { entered: boolean, setEntered: VoidFn, unsetEntered: VoidFn },
];

export function useInOutTransition(enterTime?: number, exitTime?: number): InOutTransitionReturn {
  const [entering, startEnteringRaw, stopEntering] = useToggle();
  const [exiting, startExitingRaw, stopExiting] = useToggle();
  const [entered, setEntered, unsetEntered] = useToggle(false);

  const [enteringTimeout, setEnteringTimeout] = useState<ReturnType<typeof setTimeout> | null>();
  const [exitingTimeout, setExitingTimeout] = useState<ReturnType<typeof setTimeout> | null>();

  const isMounted = useIsMounted();

  const startEntering = (afterEffect? : () => void) => {
    startEnteringRaw();

    if (enteringTimeout) {
      clearTimeout(enteringTimeout);
      setEnteringTimeout(null);
    }

    const timeout = setTimeout(() => {
      if (isMounted()) {
        stopEntering();
        setEntered();
        setEnteringTimeout(null);

        if (afterEffect) {
          afterEffect();
        }
      }
    }, enterTime || DEFAULT_TRANSITION_TIME);

    setEnteringTimeout(timeout);
  };

  const startExiting = (afterEffect?: VoidFn) => {
    unsetEntered();
    startExitingRaw();

    if (exitingTimeout) {
      clearTimeout(exitingTimeout);
      setExitingTimeout(null);
    }

    const timeout = setTimeout(() => {
      if (isMounted()) {
        stopExiting();
        setExitingTimeout(null);

        if (afterEffect) {
          afterEffect();
        }
      }
    }, exitTime || DEFAULT_TRANSITION_TIME);

    setExitingTimeout(timeout);
  };

  return [
    { entering, startEntering, stopEntering },
    { exiting, startExiting, stopExiting },
    { entered, setEntered, unsetEntered },
  ];
}

export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (isDirty) {
      window.onbeforeunload = (e) => {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes';
        return 'You have unsaved changes';
      };
    } else {
      window.onbeforeunload = null;
    }

    return () => {
      window.onbeforeunload = null;
    };
  }, [isDirty]);
}

/* useEffect that handles aborting in cleanup */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function useAbortableEffect(fn: (s: AbortSignal) => Promise<void>, deps : unknown[]) {
  useEffect(() => {
    const controller = new AbortController();

    fn(controller.signal);

    return () => {
      controller.abort();
    };
  }, deps);
}

/* useEffect that only runs on second (and subsequent) renders */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function useRerenderEffect(fn: EffectCallback, deps: unknown[]) {
  const ref = useRef(false);

  /* eslint-disable consistent-return */
  useEffect(() => {
    if (ref.current) {
      return fn();
    }

    ref.current = true;
  }, deps);
  /* eslint-enable consistent-return */
}

export default {
  useHover,
  useToggle,
  useMergeState,
  useIsMounted,
  useInOutTransition,
  useUnsavedChanges,
};
