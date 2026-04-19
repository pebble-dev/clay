'use strict';

import { assert } from 'chai';
import fixture = require('../../fixture');

describe('component - slider', function(): void {
  it('sets the value display to the correct value on set', function(): void {
    const clayConfig = fixture.clayConfig(['slider']);
    const sliderItem = clayConfig.getItemsByType('slider')[0];
    const $valueDisplay = sliderItem.$element.select('.value');
    const $valueDisplayPad = sliderItem.$element.select('.value-pad');

    const value1 = $valueDisplay.get('value');
    assert.strictEqual(value1, '50');
    const padHtml1 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml1, '50');
    sliderItem.set(75);
    const value2 = $valueDisplay.get('value');
    assert.strictEqual(value2, '75');
    const padHtml2 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml2, '75');
  });

  it('sets the value display to the correct value on slider change', function(): void {
    const clayConfig = fixture.clayConfig(['slider']);
    const sliderItem = clayConfig.getItemsByType('slider')[0];
    const $valueDisplay = sliderItem.$element.select('.value');
    const $valueDisplayPad = sliderItem.$element.select('.value-pad');
    const $slider = sliderItem.$element.select('.slider');

    const value1 = $valueDisplay.get('value');
    assert.strictEqual(value1, '50');
    const padHtml1 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml1, '50');
    $slider.set('value', 75).trigger('change');
    const value2 = $valueDisplay.get('value');
    assert.strictEqual(value2, '75');
    const padHtml2 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml2, '75');
  });

  it('sets the value-pad to the same value as what the user is typing', function(): void {
    const clayConfig = fixture.clayConfig(['slider']);
    const sliderItem = clayConfig.getItemsByType('slider')[0];
    const $valueDisplay = sliderItem.$element.select('.value');
    const $valueDisplayPad = sliderItem.$element.select('.value-pad');

    const value1 = $valueDisplay.get('value');
    assert.strictEqual(value1, '50');
    const padHtml1 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml1, '50');
    $valueDisplay.set('value', 75).trigger('input');
    const value2 = $valueDisplay.get('value');
    assert.strictEqual(value2, '75');
    const padHtml2 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml2, '75');
  });

  it('sets the slider to the correct value on user input', function(): void {
    const clayConfig = fixture.clayConfig(['slider']);
    const sliderItem = clayConfig.getItemsByType('slider')[0];
    const $valueDisplay = sliderItem.$element.select('.value');
    const $slider = sliderItem.$element.select('.slider');

    const value1 = $valueDisplay.get('value');
    assert.strictEqual(value1, '50');
    const sliderValue1 = $slider.get('value');
    assert.strictEqual(sliderValue1, '50');
    $valueDisplay.set('value', 75).trigger('change');
    const sliderValue2 = $slider.get('value');
    assert.strictEqual(sliderValue2, '75');
  });

  it('sets the precision correctly', function(): void {
    const clayConfig = fixture.clayConfig([{
      type: 'slider',
      step: 0.25
    }]);
    const sliderItem = clayConfig.getItemsByType('slider')[0];

    assert.strictEqual(sliderItem.precision, 2);
  });

  it('always displays decimal when precision is less than 1', function(): void {
    const clayConfig = fixture.clayConfig([{
      type: 'slider',
      step: 0.05
    }]);
    const sliderItem = clayConfig.getItemsByType('slider')[0];
    const $valueDisplay = sliderItem.$element.select('.value');
    const $valueDisplayPad = sliderItem.$element.select('.value-pad');
    const $slider = sliderItem.$element.select('.slider');

    const value1 = $valueDisplay.get('value');
    assert.strictEqual(value1, '50.00');
    const padHtml1 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml1, '50.00');
    const sliderValue1 = $slider.get('value');
    assert.strictEqual(sliderValue1, '50');
    sliderItem.set(75);
    const value2 = $valueDisplay.get('value');
    assert.strictEqual(value2, '75.00');
    const padHtml2 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml2, '75.00');
    const sliderValue2 = $slider.get('value');
    assert.strictEqual(sliderValue2, '75');
    sliderItem.set(33.25);
    const value3 = $valueDisplay.get('value');
    assert.strictEqual(value3, '33.25');
    const padHtml3 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml3, '33.25');
    const sliderValue3 = $slider.get('value');
    assert.strictEqual(sliderValue3, '33.25');
    sliderItem.set(17.1);
    const value4 = $valueDisplay.get('value');
    assert.strictEqual(value4, '17.10');
    const padHtml4 = $valueDisplayPad.get('innerHTML');
    assert.strictEqual(padHtml4, '17.10');
    const sliderValue4 = $slider.get('value');
    assert.strictEqual(sliderValue4, '17.1');
  });
});
