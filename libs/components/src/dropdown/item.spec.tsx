import React from 'react';
import { shallow } from 'enzyme';
import Item from './item';

describe('dropdown/item', () => {
  let onSelect: jest.Mock;

  beforeEach(() => {
    onSelect = jest.fn();
  });

  describe('handleSelect', () => {
    it('should call onSelect', () => {
      const component = shallow(<Item<string> item={{ label: 'label', value: 'value' }} onSelect={onSelect} />);

      component.find('button').prop('onClick')?.({ stopPropagation: jest.fn() } as unknown as React.MouseEvent<HTMLButtonElement>);

      expect(onSelect).toHaveBeenCalledWith({ label: 'label', value: 'value' });
    });
  });
});
