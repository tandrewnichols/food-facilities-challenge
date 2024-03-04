import React from 'react';
import { shallow } from 'enzyme';
import Text from './text';

jest.mock('@hooks/utils');
import { useInOutTransition } from '@hooks/utils';

describe('input/text', () => {
  let startEntering: jest.Mock;
  let startExiting: jest.Mock;
  let onBlur: jest.Mock;
  let onFocus: jest.Mock;
  let onChange: jest.Mock;

  beforeEach(() => {
    startEntering = jest.fn();
    startExiting = jest.fn();
    onBlur = jest.fn();
    onFocus = jest.fn();
    onChange = jest.fn();
  });

  describe('handleBlur', () => {
    beforeEach(() => {
      (useInOutTransition as jest.Mock).mockReturnValue([
        { entering: false, startEntering },
        { startExiting },
        { entered: true }
      ]);
    });

    it('should exit the transition', () => {
      const component = shallow(<Text name="name" onBlur={onBlur} onFocus={onFocus} onChange={onChange} />);

      component.find('input').prop('onBlur')?.({} as React.FocusEvent<HTMLInputElement>);

      expect(startExiting).toHaveBeenCalled();
      expect(onBlur).toHaveBeenCalledWith({});

      expect(component.find('label')).toHaveClassName('text-2xs');
    });
  });

  describe('handleFocus', () => {
    beforeEach(() => {
      (useInOutTransition as jest.Mock).mockReturnValue([
        { entering: false, startEntering },
        { startExiting },
        { entered: false }
      ]);
    });

    it('should exit the transition', () => {
      const component = shallow(<Text name="name" onBlur={onBlur} onFocus={onFocus} onChange={onChange} />);

      component.find('input').prop('onFocus')?.({} as React.FocusEvent<HTMLInputElement>);

      expect(startEntering).toHaveBeenCalled();
      expect(onFocus).toHaveBeenCalledWith({});

      expect(component.find('label')).toHaveClassName('text-base');
    });
  });
});
