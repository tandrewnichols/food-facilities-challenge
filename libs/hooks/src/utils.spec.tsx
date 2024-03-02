import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import { wait } from '@helpers/utils';
import {
  useHover,
  useToggle,
  useMergeState,
  useIsMounted,
  useInOutTransition,
  useUnsavedChanges,
  useAbortableEffect,
  useRerenderEffect,
} from './utils';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));

describe('utils', () => {
  let Component : React.FC;
  const InnerComponent = (props) => <div />;

  describe('useHover', () => {
    beforeEach(() => {
      Component = () => {
        const [hovering, mouseEnter, mouseLeave] = useHover();

        return (
          <InnerComponent hovering={hovering} onHover={mouseEnter} onStopHovering={mouseLeave} />
        );
      };
    });

    it('should toggle hovering state', () => {
      const component = shallow(<Component />);

      expect(component).toHaveProp({ hovering: false });

      component.prop('onHover')();

      expect(component).toHaveProp({ hovering: true });

      component.prop('onStopHovering')();

      expect(component).toHaveProp({ hovering: false });
    });
  });

  describe('useToggle', () => {
    beforeEach(() => {
      Component = () => {
        const [state, toggleOn, toggleOff, toggleState, setState] = useToggle();

        return (
          <InnerComponent
            state={state}
            toggleOn={toggleOn}
            toggleOff={toggleOff}
            toggleState={toggleState}
            setState={setState}
          />
        );
      };
    });

    it('should allow you to toggle state', () => {
      const component = shallow(<Component />);

      expect(component).toHaveProp({ state: false });

      component.prop('toggleOn')();

      expect(component).toHaveProp({ state: true });

      component.prop('toggleOff')();

      expect(component).toHaveProp({ state: false });

      component.prop('toggleState')();

      expect(component).toHaveProp({ state: true });

      component.prop('setState')(false);

      expect(component).toHaveProp({ state: false });
    });
  });

  describe('useMergeState', () => {
    const data = {
      foo: {
        boom: 'baby',
        bar: {
          baz: 'quux',
        },
      },
    };

    beforeEach(() => {
      Component = () => {
        const [state, setState] = useMergeState(data);

        return (
          <InnerComponent data={state} changeData={(newState) => setState(newState)} />
        );
      };
    });

    it('should merge new state with old state', () => {
      const component = shallow(<Component />);

      expect(component).toHaveProp({ data });

      component.prop('changeData')({
        a: true,
        foo: {
          b: true,
          bar: {
            c: true,
            baz: {
              d: true,
            },
          },
          hello: 'world',
        },
      });

      expect(component).toHaveProp({
        data: {
          a: true,
          foo: {
            b: true,
            boom: 'baby',
            bar: {
              c: true,
              baz: {
                d: true,
              },
            },
            hello: 'world',
          },
        },
      });
    });
  });

  describe('useIsMounted', () => {
    let cleanupFunc : () => void;

    beforeEach(() => {
      (useEffect as jest.Mock).mockImplementation((fn) => {
        cleanupFunc = fn();
      });

      Component = () => {
        const isMounted = useIsMounted();
        return (
          <InnerComponent isMounted={isMounted} />
        );
      };
    });

    it('should return true when mounted', () => {
      const component = shallow(<Component />);

      expect(component.prop('isMounted')()).toBe(true);

      cleanupFunc();

      expect(component.prop('isMounted')()).toBe(false);
    });
  });

  describe('useInOutTransition', () => {
    let entering : boolean;
    let startEntering : (cb : () => void) => void;
    let stopEntering : () => void;
    let exiting : boolean;
    let startExiting : (cb : () => void) => void;
    let stopExiting : () => void;
    let entered : boolean;
    let setEntered : () => void;
    let unsetEntered : () => void;
    let afterEffect : () => void;

    beforeEach(() => {
      jest.spyOn(global, 'clearTimeout');
    });

    afterEach(() => {
      (global.clearTimeout as jest.Mock).mockRestore();
    });

    describe('with the default timeout', () => {
      beforeEach(() => {
        afterEffect = jest.fn();

        Component = () => {
          [
            { entering, startEntering, stopEntering },
            { exiting, startExiting, stopExiting },
            { entered, setEntered, unsetEntered },
          ] = useInOutTransition();

          return (
            <InnerComponent
              entering={entering}
              startEntering={startEntering}
              stopEntering={stopEntering}
              exiting={exiting}
              startExiting={startExiting}
              stopExiting={stopExiting}
              entered={entered}
              setEntered={setEntered}
              unsetEntered={unsetEntered}
            />
          );
        };
      });

      describe('startEntering', () => {
        it('should start the in transition and automatically stop it', async () => {
          const component = shallow(<Component />);

          expect(component).toHaveProp({ entering: false, exiting: false, entered: false });

          component.prop('startEntering')(afterEffect);

          expect(component).toHaveProp({ entering: true, exiting: false, entered: false });

          await wait(151);

          expect(afterEffect).toHaveBeenCalled();
          expect(component).toHaveProp({ entering: false, exiting: false, entered: true });
          expect(global.clearTimeout).not.toHaveBeenCalled();

          component.prop('startEntering')();
          component.prop('startEntering')();

          await wait(151);
          expect(global.clearTimeout).toHaveBeenCalled();
        });
      });

      describe('startExiting', () => {
        it('should start the out transition and automatically stop it', async () => {
          const component = shallow(<Component />);

          expect(component).toHaveProp({ entering: false, exiting: false, entered: false });

          component.prop('startExiting')(afterEffect);

          expect(component).toHaveProp({ entering: false, exiting: true, entered: false });

          await wait(151);

          expect(afterEffect).toHaveBeenCalled();
          expect(component).toHaveProp({ entering: false, exiting: false, entered: false });
          expect(global.clearTimeout).not.toHaveBeenCalled();

          component.prop('startExiting')();
          component.prop('startExiting')();

          await wait(151);
          expect(global.clearTimeout).toHaveBeenCalled();
        });
      });
    });

    describe('with custom timeouts', () => {
      beforeEach(() => {
        afterEffect = jest.fn();

        Component = () => {
          [
            { entering, startEntering, stopEntering },
            { exiting, startExiting, stopExiting },
            { entered, setEntered, unsetEntered },
          ] = useInOutTransition(200, 200);

          return (
            <InnerComponent
              entering={entering}
              startEntering={startEntering}
              stopEntering={stopEntering}
              exiting={exiting}
              startExiting={startExiting}
              stopExiting={stopExiting}
              entered={entered}
              setEntered={setEntered}
              unsetEntered={unsetEntered}
            />
          );
        };
      });

      describe('startEntering', () => {
        it('should start the in transition and automatically stop it', async () => {
          const component = shallow(<Component />);

          expect(component).toHaveProp({ entering: false, exiting: false, entered: false });

          component.prop('startEntering')(afterEffect);

          expect(component).toHaveProp({ entering: true, exiting: false, entered: false });

          await wait(250);

          expect(afterEffect).toHaveBeenCalled();
          expect(component).toHaveProp({ entering: false, exiting: false, entered: true });
          expect(global.clearTimeout).not.toHaveBeenCalled();

          component.prop('startEntering')();
          component.prop('startEntering')();

          await wait(250);
          expect(global.clearTimeout).toHaveBeenCalled();
        });
      });

      describe('startExiting', () => {
        it('should start the out transition and automatically stop it', async () => {
          const component = shallow(<Component />);

          expect(component).toHaveProp({ entering: false, exiting: false, entered: false });

          component.prop('startExiting')(afterEffect);

          expect(component).toHaveProp({ entering: false, exiting: true, entered: false });

          await wait(250);

          expect(afterEffect).toHaveBeenCalled();
          expect(component).toHaveProp({ entering: false, exiting: false, entered: false });
          expect(global.clearTimeout).not.toHaveBeenCalled();

          component.prop('startExiting')();
          component.prop('startExiting')();

          await wait(250);
          expect(global.clearTimeout).toHaveBeenCalled();
        });
      });
    });
  });

  describe('useUnsavedChanges', () => {
    let preventDefault : jest.Mock;
    let cleanupFunc : () => void;

    beforeEach(() => {
      global.window = {} as Window & typeof globalThis;
      preventDefault = jest.fn();

      (useEffect as jest.Mock).mockImplementation((fn) => {
        cleanupFunc = fn();
      });
    });

    describe('with differences', () => {
      beforeEach(() => {
        Component = () => {
          useUnsavedChanges(true);

          return (
            <div />
          );
        };
      });

      it('should register an onbeforeunload handler', () => {
        shallow(<Component />);
        const onbeforeunload = window.onbeforeunload as (e : object) => void;
        expect(onbeforeunload).toEqual(expect.any(Function));
        expect(onbeforeunload({ preventDefault })).toEqual('You have unsaved changes');

        cleanupFunc();

        expect(window.onbeforeunload).toEqual(null);
      });
    });

    describe('without differences', () => {
      beforeEach(() => {
        Component = () => {
          useUnsavedChanges(false);

          return (
            <div />
          );
        };
      });

      it('should do nothing', () => {
        shallow(<Component />);
        expect(window.onbeforeunload).toEqual(null);
      });
    });
  });

  describe('useAbortableEffect', () => {
    let effectFn : () => () => void;
    let fn : jest.Mock;

    beforeEach(() => {
      fn = jest.fn();

      (useEffect as jest.Mock).mockImplementation((f) => {
        effectFn = f;
      });

      Component = () => {
        useAbortableEffect(fn, []);

        return (
          <div />
        );
      };
    });

    it('shoud call fn with an abort controller', () => {
      shallow(<Component />);

      const cleanUp = effectFn();

      expect(fn).toHaveBeenCalledWith(expect.any(AbortSignal));

      cleanUp();

      expect(fn.mock.calls[0][0].aborted).toEqual(true);
    });
  });

  describe('useRerenderEffect', () => {
    let effectFn : () => void;
    let fn : jest.Mock;

    beforeEach(() => {
      fn = jest.fn();

      (useEffect as jest.Mock).mockImplementation((f) => {
        effectFn = f;
      });

      Component = () => {
        useRerenderEffect(fn, []);

        return (
          <div />
        );
      };
    });

    it('shoud call fn with an abort controller', () => {
      shallow(<Component />);

      effectFn();

      expect(fn).not.toHaveBeenCalled();

      effectFn();

      expect(fn).toHaveBeenCalled();
    });
  });
});
