'use strict';

import { assert } from 'chai';
import fixture = require('../../fixture');

describe('component - select', function(): void {
  it('sets the value display to the correct value on change', function(): void {
    const clayConfig = fixture.clayConfig([
      {
        type: 'select',
        defaultValue: 'value-1',
        options: [
          { label: 'label 1', value: 'value-1' },
          { label: 'label 2', value: 'value-2' }
        ]
      }
    ]);
    const selectItem = clayConfig.getItemsByType('select')[0];
    const $valueDisplay = selectItem.$element.select('.value');
    const value1 = $valueDisplay.get('innerHTML');
    assert.strictEqual(value1, 'label 1');
    selectItem.set('value-2');
    const value2 = $valueDisplay.get('innerHTML');
    assert.strictEqual(value2, 'label 2');
  });

  it('sets the value display to the correct value on change when using optgroups',
  function(): void {
    const clayConfig = fixture.clayConfig([
      {
        type: 'select',
        defaultValue: 'value-1',
        options: [
          { label: 'label 1', value: 'value-1' },
          { label: 'group', value: [
            { label: 'label 2', value: 'value-2' },
            { label: 'label 3', value: 'value-3' }
          ]}
        ]
      }
    ]);
    const selectItem = clayConfig.getItemsByType('select')[0];
    const $valueDisplay = selectItem.$element.select('.value');
    const value1 = $valueDisplay.get('innerHTML');
    assert.strictEqual(value1, 'label 1');
    selectItem.set('value-2');
    const value2 = $valueDisplay.get('innerHTML');
    assert.strictEqual(value2, 'label 2');
  });
});
