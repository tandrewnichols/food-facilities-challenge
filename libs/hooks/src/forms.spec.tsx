import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import { Keys } from '@sharedTypes/components';
import { when } from 'jest-when';
import { useFieldState, useArrowSelection } from './forms';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));

describe('forms', () => {
  let Component: React.FC;
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const InnerComponent = (props: any) => <div />;

  describe('useFieldState', () => {
    beforeEach(() => {
      Component = () => {
        const [state, updateState, setState] = useFieldState();

        return (
          <InnerComponent state={state} updateState={updateState} setState={setState} />
        );
      };
    });

    it('should unwrap the event value', () => {
      const component = shallow(<Component />);

      expect(component).toHaveProp({ state: '' });

      component.prop('updateState')({
        target: {
          value: 'foo',
        },
      });

      expect(component).toHaveProp({ state: 'foo' });
    });

    it('should allow you to set the value directly', () => {
      const component = shallow(<Component />);

      expect(component).toHaveProp({ state: '' });

      component.prop('setState')('bar');

      expect(component).toHaveProp({ state: 'bar' });
    });
  });

  describe('useArrowSelection', () => {
    let onSelect: jest.Mock;
    let close: jest.Mock;
    let preventDefault: jest.Mock;
    let useEffectIndex: () => void;
    let useEffectSelect: () => void;

    beforeEach(() => {
      onSelect = jest.fn();
      close = jest.fn();
      preventDefault = jest.fn();

      when(useEffect as jest.Mock).mockImplementation((fn: () => void, deps: string[] | string[][]) => {
        if (Array.isArray(deps[0])) {
          useEffectIndex = fn;
        } else {
          useEffectSelect = fn;
        }
      });

      Component = () => {
        const [index, handleArrows] = useArrowSelection<string>(
          [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
            { label: 'c', value: 'c' },
          ],
          onSelect,
          close,
        );

        return (
          <InnerComponent index={index} handleArrows={handleArrows} />
        );
      };
    });

    it('should create a keydown handler for arrows', async () => {
      const component = shallow(<Component />);

      expect(component).toHaveProp({ index: -1 });

      component.prop('handleArrows')({ key: Keys.ARROW_DOWN, preventDefault } as unknown as KeyboardEvent);
      expect(component).toHaveProp({ index: 0 });

      component.prop('handleArrows')({ key: Keys.TAB, preventDefault } as unknown as KeyboardEvent);
      expect(component).toHaveProp({ index: 1 });

      component.prop('handleArrows')({ key: Keys.TAB, shiftKey: true, preventDefault } as unknown as KeyboardEvent);
      expect(component).toHaveProp({ index: 0 });

      component.prop('handleArrows')({ key: Keys.ARROW_UP, preventDefault } as unknown as KeyboardEvent);
      expect(component).toHaveProp({ index: -1 });

      component.prop('handleArrows')({ key: Keys.ARROW_UP, preventDefault } as unknown as KeyboardEvent);
      expect(component).toHaveProp({ index: 2 });

      component.prop('handleArrows')({ key: Keys.ARROW_DOWN, preventDefault } as unknown as KeyboardEvent);
      expect(component).toHaveProp({ index: -1 });

      component.prop('handleArrows')({ key: Keys.ARROW_DOWN, preventDefault } as unknown as KeyboardEvent);
      component.prop('handleArrows')({ key: Keys.ENTER, preventDefault } as unknown as KeyboardEvent);

      component.prop('handleArrows')({ key: Keys.TAB, preventDefault } as unknown as KeyboardEvent);
      component.prop('handleArrows')({ key: Keys.TAB, preventDefault } as unknown as KeyboardEvent);
      component.prop('handleArrows')({ key: Keys.TAB, preventDefault } as unknown as KeyboardEvent);
      expect(close).toHaveBeenCalled();
      close.mockReset();

      component.prop('handleArrows')({ key: Keys.TAB, shiftKey: true, preventDefault } as unknown as KeyboardEvent);
      component.prop('handleArrows')({ key: Keys.TAB, shiftKey: true, preventDefault } as unknown as KeyboardEvent);
      component.prop('handleArrows')({ key: Keys.TAB, shiftKey: true, preventDefault } as unknown as KeyboardEvent);
      component.prop('handleArrows')({ key: Keys.TAB, shiftKey: true, preventDefault } as unknown as KeyboardEvent);
      expect(close).toHaveBeenCalled();
      close.mockReset();

      useEffectSelect();
      expect(onSelect).toHaveBeenCalledWith({ label: 'a', value: 'a' });

      component.prop('handleArrows')({ key: Keys.ESC, preventDefault } as unknown as KeyboardEvent);
      expect(close).toHaveBeenCalled();

      component.setProps({ list: ['d', 'e', 'f']});
      useEffectIndex();
      expect(component).toHaveProp({ index: -1 });
    });
  });
});
