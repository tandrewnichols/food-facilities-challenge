import React, { useEffect } from 'react';
import { shallow } from 'enzyme';
import Dropdown from './dropdown';
import { Keys } from '@sharedTypes/components';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn()
}));

describe('dropdown/dropdown', () => {
  let onSelect: jest.Mock;
  let onClear: jest.Mock;
  let items: { label: string, value: string }[];
  let effectFn: () => void;

  beforeEach(() => {
    onSelect = jest.fn();
    onClear = jest.fn();
    items = [{ label: 'label', value: 'value' }];
    (useEffect as jest.Mock).mockImplementation((fn: () => void) => effectFn = fn);
  });

  describe('handleSelect', () => {
    it('should set the selected option', () => {
      const component = shallow(
        <Dropdown<string>
          name="name"
          items={items}
          placeholder="Search"
          onSelect={onSelect}
          onClear={onClear}
        />
      );

      component.find('button').prop('onClick')?.({ stopPropagation: jest.fn() } as unknown as React.MouseEvent<HTMLButtonElement>);
      component.find('DropdownList').prop('onSelect')?.(items[0] as any);

      expect(component.find('div[role="combobox"]')).toHaveText('label');
      expect(onSelect).toHaveBeenCalledWith('value');
      expect(component.find('DropdownList')).toHaveLength(0);
    });
  });

  describe('handleClear', () => {
    it('should clear the option', () => {
      const component = shallow(
        <Dropdown<string>
          name="name"
          items={items}
          placeholder="Search"
          onSelect={onSelect}
          onClear={onClear}
        />
      );

      component.find('button').prop('onClick')?.({ stopPropagation: jest.fn() } as unknown as React.MouseEvent<HTMLButtonElement>);
      const onClearProp = component.find('DropdownList').prop('onClear') as () => void;
      onClearProp();

      expect(component.find('div[role="combobox"]')).toHaveText('Search');
      expect(onClear).toHaveBeenCalled();
      expect(component.find('DropdownList')).toHaveLength(0);
    });
  });

  describe('onKeyDown', () => {
    it('should open and close the dropdown', () => {
      const component = shallow(
        <Dropdown<string>
          name="name"
          items={items}
          placeholder="Search"
          onSelect={onSelect}
          onClear={onClear}
        />
      );

      expect(component.find('DropdownList')).toHaveLength(0);
      component.find('button').prop('onKeyDown')?.({ preventDefault: jest.fn(), key: Keys.ENTER } as unknown as React.KeyboardEvent<HTMLButtonElement>);
      expect(component.find('DropdownList')).toHaveLength(1);
      component.find('button').prop('onKeyDown')?.({ preventDefault: jest.fn(), key: Keys.ESC } as unknown as React.KeyboardEvent<HTMLButtonElement>);
      expect(component.find('DropdownList')).toHaveLength(0);
    });
  });

  describe('useEffect', () => {
    it('should update the selected value', () => {
      const component = shallow(
        <Dropdown<string>
          name="name"
          value="value"
          items={items}
          placeholder="Search"
          onSelect={onSelect}
          onClear={onClear}
        />
      );

      effectFn();
      expect(component.find('div[role="combobox"]')).toHaveText('value');
    });
  });
});
