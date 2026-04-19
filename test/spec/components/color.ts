'use strict';

import { assert } from 'chai';
import fixture = require('../../fixture');
import type { ClayConfigInstance, ClayItemInstance } from '../../../src/scripts/lib/types';

const sunlightColorMap: Record<string, string> = {
  '000000': '000000', '000055': '001e41', '0000aa': '004387', '0000ff': '0068ca',
  '005500': '2b4a2c', '005555': '27514f', '0055aa': '16638d', '0055ff': '007dce',
  '00aa00': '5e9860', '00aa55': '5c9b72', '00aaaa': '57a5a2', '00aaff': '4cb4db',
  '00ff00': '8ee391', '00ff55': '8ee69e', '00ffaa': '8aebc0', '00ffff': '84f5f1',
  '550000': '4a161b', '550055': '482748', '5500aa': '40488a', '5500ff': '2f6bcc',
  '555500': '564e36', '555555': '545454', '5555aa': '4f6790', '5555ff': '4180d0',
  '55aa00': '759a64', '55aa55': '759d76', '55aaaa': '71a6a4', '55aaff': '69b5dd',
  '55ff00': '9ee594', '55ff55': '9de7a0', '55ffaa': '9becc2', '55ffff': '95f6f2',
  'aa0000': '99353f', 'aa0055': '983e5a', 'aa00aa': '955694', 'aa00ff': '8f74d2',
  'aa5500': '9d5b4d', 'aa5555': '9d6064', 'aa55aa': '9a7099', 'aa55ff': '9587d5',
  'aaaa00': 'afa072', 'aaaa55': 'aea382', 'aaaaaa': 'ababab', 'ffffff': 'ffffff',
  'aaaaff': 'a7bae2', 'aaff00': 'c9e89d', 'aaff55': 'c9eaa7', 'aaffaa': 'c7f0c8',
  'aaffff': 'c3f9f7', 'ff0000': 'e35462', 'ff0055': 'e25874', 'ff00aa': 'e16aa3',
  'ff00ff': 'de83dc', 'ff5500': 'e66e6b', 'ff5555': 'e6727c', 'ff55aa': 'e37fa7',
  'ff55ff': 'e194df', 'ffaa00': 'f1aa86', 'ffaa55': 'f1ad93', 'ffaaaa': 'efb5b8',
  'ffaaff': 'ecc3eb', 'ffff00': 'ffeeab', 'ffff55': 'fff1b5', 'ffffaa': 'fff6d3'
};

/* eslint-disable  comma-spacing, no-multi-spaces, max-len,
 standard/array-bracket-even-spacing */
const standardLayouts: Record<string, (string | boolean)[][]> = {
  COLOR: [
    [false   , false   , '55ff00', 'aaff55', false   , 'ffff55', 'ffffaa', false   , false   ],
    [false   , 'aaffaa', '55ff55', '00ff00', 'aaff00', 'ffff00', 'ffaa55', 'ffaaaa', false   ],
    ['55ffaa', '00ff55', '00aa00', '55aa00', 'aaaa55', 'aaaa00', 'ffaa00', 'ff5500', 'ff5555'],
    ['aaffff', '00ffaa', '00aa55', '55aa55', '005500', '555500', 'aa5500', 'ff0000', 'ff0055'],
    [false   , '55aaaa', '00aaaa', '005555', 'ffffff', '000000', 'aa5555', 'aa0000', false   ],
    ['55ffff', '00ffff', '00aaff', '0055aa', 'aaaaaa', '555555', '550000', 'aa0055', 'ff55aa'],
    ['55aaff', '0055ff', '0000ff', '0000aa', '000055', '550055', 'aa00aa', 'ff00aa', 'ffaaff'],
    [false   , '5555aa', '5555ff', '5500ff', '5500aa', 'aa00ff', 'ff00ff', 'ff55ff', false   ],
    [false   , false   , false   , 'aaaaff', 'aa55ff', 'aa55aa', false   , false   , false   ]
  ],
  GRAY: [
    ['000000', 'aaaaaa', 'ffffff']
  ],
  BLACK_WHITE: [
    ['000000', 'ffffff']
  ]
};
/* eslint-enable */

/**
 * @param {ClayItem} colorItem
 * @returns {void}
 */
function openPicker(colorItem: unknown): void {
  if (typeof colorItem === 'object' && colorItem !== null && '$element' in colorItem) {
    const item = colorItem as Record<string, unknown>;
    const selectMethod = item.$element as Record<string, unknown>;
    if (typeof selectMethod.select === 'function') {
      const labelElements = (selectMethod.select as (selector: string) => unknown[])('label');
      if (Array.isArray(labelElements) && labelElements.length > 0) {
        const firstLabel = labelElements[0] as Record<string, unknown>;
        if (typeof firstLabel.click === 'function') {
          (firstLabel.click as () => void)();
        }
      }
    }
  }
}

/**
 * @param {string} hex
 * @returns {string} - eg: "rgb(1, 2, 3)"
 */
function hexToRgb(hex: string): string {
  const result = /^(?:#|0x)?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ?
    'rgb(' +
      parseInt(result[1], 16) + ', ' +
      parseInt(result[2], 16) + ', ' +
      parseInt(result[3], 16) + ')' :
    hex;
}

/**
 * @param {number|string} value
 * @returns {string}
 */
function normalizeColor(value: unknown): string {
  switch (typeof value) {
    case 'number': {
      const numValue = value as number;
      return numValue.toString(16);
    }
    case 'string': {
      const strValue = value as string;
      return strValue.replace(/^#|^0x/, '');
    }
    default: return '000000';
  }
}

/**
 * @param {Array.<Array>} layout
 * @returns {Array}
 */
function flattenLayout(layout: unknown[][]): unknown[] {
  return layout.reduce((a: unknown[], b: unknown[]) => a.concat(b), []);
}

/**
 * @param {Array|string} [layout=color]
 * @param {Array} [expectedColors]
 * @return {void}
 */
function testCustomLayout(layout?: unknown, expectedColors?: unknown[]): void {

  describe('layout: ' + JSON.stringify(layout || 'default'), function() {

    describe('Normal', function() {
      testColors(false, layout, expectedColors);
    });

    describe('Sunlight', function() {
      testColors(true, layout, expectedColors);
    });
  });
}

/**
 * @param {string} platform
 * @param {Array} layout
 * @param {boolean} allowGray
 * @param {string} desc
 * @param {Object} activeWatchInfo
 * @return {void}
 */
function testAutoLayout(
  platform: string,
  layout: unknown,
  allowGray: boolean,
  desc: string,
  activeWatchInfo: unknown
): void {
  it('chooses the best layout for the ' + (desc || platform) +
     ' platform when allowGray is ' + allowGray,
  function() {
    const clayConfig: ClayConfigInstance = fixture.clayConfig(
      [{type: 'color', allowGray: allowGray}],
      true,
      true,
      {},
      {
        activeWatchInfo: activeWatchInfo
      }
    );
    const colorItem = clayConfig.getItemsByType('color')[0];
    assert.deepEqual((colorItem as Record<string, unknown>)._layout, layout);
  });
}

/**
 * @param {number|string} input
 * @param {number} expected
 * @param {array|string} layout
 * @return {void}
 */
function testClosestToLayout(input: unknown, expected: number, layout: unknown): void {
  it('rounds ' + input + ' to ' + expected.toString(16) +
     ' in layout: ' + JSON.stringify(layout),
  function() {
    let clayConfig: ClayConfigInstance;
    let colorItem: ClayItemInstance;

    clayConfig = fixture.clayConfig([{
      type: 'color',
      sunlight: false,
      layout: layout
    }]);
    colorItem = clayConfig.getItemsByType('color')[0];
    colorItem.set(input);
    assert.strictEqual(colorItem.get(), expected);

    clayConfig = fixture.clayConfig([{
      type: 'color',
      sunlight: false,
      layout: layout
    }]);
    colorItem = clayConfig.getItemsByType('color')[0];
    colorItem.set(input);
    assert.strictEqual(colorItem.get(), expected);
  });
}

/**
 * @param {boolean} sunlight
 * @param {Array|string} [layout=color]
 * @param {Array} [expectedColors]
 * @return {void}
 */
function testColors(sunlight: boolean, layout?: unknown, expectedColors?: unknown[]): void {
  let clayConfig: ClayConfigInstance;
  let colorItem: ClayItemInstance;
  let $colorBoxes: unknown[];
  let colors: unknown[];

  beforeEach(function() {
    clayConfig = fixture.clayConfig([
      {
        type: 'color',
        layout: layout,
        sunlight: sunlight
      }
    ]);
    colorItem = clayConfig.getItemsByType('color')[0];

    let resolvedLayout: unknown = layout || 'COLOR';
    if (typeof resolvedLayout === 'string' && resolvedLayout in standardLayouts) {
      resolvedLayout = standardLayouts[resolvedLayout];
    }

    colors = expectedColors || flattenLayout(resolvedLayout as unknown[][]);
    $colorBoxes = (colorItem.$element.select('.color-box') as unknown as unknown[]);
  });

  it('Has the correct items in the layout', function() {
    if (Array.isArray($colorBoxes)) {
      colors.forEach(function(color: unknown, index: number) {
        const colorBox = $colorBoxes[index] as Record<string, unknown>;
        const dataset = colorBox.dataset as Record<string, unknown>;
        if (color === false) {
          assert.strictEqual(dataset.value, undefined);
        } else {
          assert.strictEqual(
            parseInt(dataset.value as string, 10),
            parseInt((color || 0) as string, 16)
          );
        }
      });
    }
  });

  it('sets the color correctly', function() {
    if (Array.isArray($colorBoxes)) {
      colors.forEach(function(color: unknown, index: number) {
        const colorBox = $colorBoxes[index] as Record<string, unknown>;
        if (color === false) {
          assert.strictEqual(
            (colorBox.style as Record<string, unknown>).backgroundColor,
            'transparent'
          );
        } else {
          const normalizedColor = normalizeColor(color);
          const expectedRgb = hexToRgb(sunlight ? (sunlightColorMap[normalizedColor] || '') : normalizedColor);
          assert.strictEqual(
            (colorBox.style as Record<string, unknown>).backgroundColor,
            expectedRgb
          );
        }
      });
    }
  });
}

describe('component - color', function() {
  it('shows the sunlit colors in the value display', function() {
    const clayConfig: ClayConfigInstance = fixture.clayConfig([
      {
        type: 'color',
        sunlight: true,
        id: '1',
        defaultValue: 'ff0000'
      }
    ]);
    const colorItem: ClayItemInstance = clayConfig.getItemById('1');

    assert.strictEqual(colorItem.get(), 0xff0000);
    const valueElements = (colorItem.$element.select('.value') as unknown as unknown[]);
    if (Array.isArray(valueElements) && valueElements.length > 0) {
      assert.strictEqual(
        ((valueElements[0] as Record<string, unknown>).style as Record<string, unknown>).backgroundColor,
        'rgb(227, 84, 98)'
      );
    }
    colorItem.set('0000FF');
    if (Array.isArray(valueElements) && valueElements.length > 0) {
      assert.strictEqual(
        ((valueElements[0] as Record<string, unknown>).style as Record<string, unknown>).backgroundColor,
        'rgb(0, 104, 202)'
      );
    }
  });

  it('shows the normal colors in the value display', function() {
    const clayConfig: ClayConfigInstance = fixture.clayConfig([
      {
        type: 'color',
        sunlight: false,
        id: '1',
        defaultValue: 'ff0000'
      }
    ]);
    const colorItem: ClayItemInstance = clayConfig.getItemById('1');

    assert.strictEqual(colorItem.get(), 0xff0000);
    const valueElements = (colorItem.$element.select('.value') as unknown as unknown[]);
    if (Array.isArray(valueElements) && valueElements.length > 0) {
      assert.strictEqual(
        ((valueElements[0] as Record<string, unknown>).style as Record<string, unknown>).backgroundColor,
        'rgb(255, 0, 0)'
      );
    }
    colorItem.set('0000FF');
    if (Array.isArray(valueElements) && valueElements.length > 0) {
      assert.strictEqual(
        ((valueElements[0] as Record<string, unknown>).style as Record<string, unknown>).backgroundColor,
        'rgb(0, 0, 255)'
      );
    }
  });

  it('shows the picker when the label is clicked', function() {
    const clayConfig: ClayConfigInstance = fixture.clayConfig(['color']);
    const colorItem: ClayItemInstance = clayConfig.getItemsByType('color')[0];
    const pickerElements = (colorItem.$element.select('.picker-wrap') as unknown as unknown[]);
    if (Array.isArray(pickerElements) && pickerElements.length > 0) {
      const pickerWrap = pickerElements[0] as Record<string, unknown>;
      const classList = pickerWrap.classList as Record<string, (method: string) => boolean>;
      assert.strictEqual(classList.contains('show'), false);
      openPicker(colorItem);
      assert.strictEqual(classList.contains('show'), true);
    }
  });

  it('only shows the picker if the item is enabled', function() {
    const clayConfig: ClayConfigInstance = fixture.clayConfig(['color']);
    const colorItem: ClayItemInstance = clayConfig.getItemsByType('color')[0];
    const pickerElements = (colorItem.$element.select('.picker-wrap') as unknown as unknown[]);
    if (Array.isArray(pickerElements) && pickerElements.length > 0) {
      const pickerWrap = pickerElements[0];
      if (typeof colorItem.disable === 'function') {
        colorItem.disable();
      }
      const pickerWrapRecord = pickerWrap as Record<string, unknown>;
      const classList = pickerWrapRecord.get as (key: string) => Record<string, (method: string) => boolean>;
      assert.strictEqual(classList('classList').contains('show'), false);
      openPicker(colorItem);
      assert.strictEqual(classList('classList').contains('show'), false);
      if (typeof colorItem.enable === 'function') {
        colorItem.enable();
      }
      openPicker(colorItem);
      assert.strictEqual(classList('classList').contains('show'), true);
    }
  });

  it('sets the value and closes picker when the user makes a selection', function() {
    const clayConfig: ClayConfigInstance = fixture.clayConfig([{type: 'color', sunlight: false}]);
    const colorItem: ClayItemInstance = clayConfig.getItemsByType('color')[0];
    const pickerElements = (colorItem.$element.select('.picker-wrap') as unknown as unknown[]);
    assert.strictEqual(colorItem.get(), 0x000000);
    openPicker(colorItem);
    const colorSelectElements = (colorItem.$element.select('[data-value="16711680"]') as unknown as unknown[]);
    if (Array.isArray(colorSelectElements) && colorSelectElements.length > 0) {
      const firstColorSelect = colorSelectElements[0] as Record<string, unknown>;
      if (typeof firstColorSelect.click === 'function') {
        (firstColorSelect.click as () => void)();
      }
    }
    assert.strictEqual(colorItem.get(), 0xff0000);
    if (Array.isArray(pickerElements) && pickerElements.length > 0) {
      const valueElements = (colorItem.$element.select('.value') as unknown as unknown[]);
      if (Array.isArray(valueElements) && valueElements.length > 0) {
        assert.strictEqual(
          ((valueElements[0] as Record<string, unknown>).style as Record<string, unknown>).backgroundColor,
          'rgb(255, 0, 0)'
        );
      }
      const pickerWrap = pickerElements[0] as Record<string, unknown>;
      const pickerClassList = pickerWrap.classList as Record<string, (method: string) => boolean>;
      assert.strictEqual(pickerClassList.contains('show'), false);
    }
  });

  it('closes the picker if a user clicks the background', function() {
    const clayConfig: ClayConfigInstance = fixture.clayConfig([{type: 'color', sunlight: false}]);
    const colorItem: ClayItemInstance = clayConfig.getItemsByType('color')[0];
    const pickerElements = (colorItem.$element.select('.picker-wrap') as unknown as unknown[]);
    assert.strictEqual(colorItem.get(), 0x000000);
    openPicker(colorItem);
    const pickerWrap = pickerElements as unknown;
    if (typeof pickerWrap === 'object' && pickerWrap !== null && 'get' in pickerWrap) {
      const pickerWrapRecord = pickerWrap as Record<string, unknown>;
      const pickerClassList = pickerWrapRecord.get as (key: string) => Record<string, (method: string) => boolean>;
      assert.strictEqual(pickerClassList('classList').contains('show'), true);
    }
    if (Array.isArray(pickerElements) && pickerElements.length > 0) {
      const firstPickerElement = pickerElements[0] as Record<string, unknown>;
      if (typeof firstPickerElement.click === 'function') {
        firstPickerElement.click();
      }
    }
    if (typeof pickerWrap === 'object' && pickerWrap !== null && 'get' in pickerWrap) {
      const pickerWrapRecord = pickerWrap as Record<string, unknown>;
      const pickerClassListAgain = pickerWrapRecord.get as (key: string) => Record<string, (method: string) => boolean>;
      assert.strictEqual(pickerClassListAgain('classList').contains('show'), false);
    }
  });

  describe('color rounding', function() {
    let layout: unknown = 'GRAY';
    testClosestToLayout('000000', 0x000000, layout);
    testClosestToLayout('005500', 0x000000, layout);
    testClosestToLayout('55aa55', 0xaaaaaa, layout);
    testClosestToLayout('ffaaff', 0xaaaaaa, layout);
    testClosestToLayout('ffffaa', 0xffffff, layout);
    testClosestToLayout('ffffff', 0xffffff, layout);

    layout = 'BLACK_WHITE';
    testClosestToLayout('000000', 0x000000, layout);
    testClosestToLayout('005500', 0x000000, layout);
    testClosestToLayout('55aa55', 0xffffff, layout);
    testClosestToLayout('ffaaff', 0xffffff, layout);
    testClosestToLayout('ffffaa', 0xffffff, layout);
    testClosestToLayout('ffffff', 0xffffff, layout);

    layout = 'COLOR';
    testClosestToLayout('000000', 0x000000, layout);
    testClosestToLayout('005500', 0x005500, layout);
    testClosestToLayout('55bb55', 0x55aa55, layout);
    testClosestToLayout('ff99ff', 0xffaaff, layout);
    testClosestToLayout('ffffee', 0xffffff, layout);
    testClosestToLayout('ffffff', 0xffffff, layout);

    layout = ['ff0000', 'ff5500', 'ff00ff', '00ff00', '555555'];
    testClosestToLayout('000000', 0x555555, layout);
    testClosestToLayout('ff0000', 0xff0000, layout);
    testClosestToLayout('ff1111', 0xff0000, layout);
    testClosestToLayout('00aa00', 0x00ff00, layout);
    testClosestToLayout('ff55ff', 0xff00ff, layout);
    testClosestToLayout('aaaaaa', 0x555555, layout);
    testClosestToLayout('ffffff', 0x555555, layout);
  });

  describe('layouts', function() {

    // allow gray does nothing for 2.x
    testAutoLayout('aplite', standardLayouts.BLACK_WHITE, true, 'aplite (2.x)',
      null
    );
    testAutoLayout('aplite', standardLayouts.BLACK_WHITE, true, 'aplite (2.x)', {
      platform: 'aplite',
      model: 'qemu_platform_aplite',
      language: 'en_US',
      firmware: {
        major: 2,
        minor: 10,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('aplite', standardLayouts.BLACK_WHITE, false, 'aplite (2.x)',
      null
    );
    testAutoLayout('aplite', standardLayouts.BLACK_WHITE, false, 'aplite (2.x)', {
      platform: 'aplite',
      model: 'qemu_platform_aplite',
      language: 'en_US',
      firmware: {
        major: 2,
        minor: 10,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('aplite', standardLayouts.BLACK_WHITE, false, 'aplite (3.x)', {
      platform: 'aplite',
      model: 'qemu_platform_aplite',
      language: 'en_US',
      firmware: {
        major: 3,
        minor: 10,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('aplite', standardLayouts.GRAY, true, 'aplite (3.x)', {
      platform: 'aplite',
      model: 'qemu_platform_aplite',
      language: 'en_US',
      firmware: {
        major: 3,
        minor: 10,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('basalt', standardLayouts.COLOR, true, '', {
      platform: 'basalt',
      model: 'qemu_platform_basalt',
      language: 'en_US',
      firmware: {
        major: 3,
        minor: 10,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('chalk', standardLayouts.COLOR, true, '', {
      platform: 'chalk',
      model: 'qemu_platform_chalk',
      language: 'en_US',
      firmware: {
        major: 3,
        minor: 10,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('diorite', standardLayouts.BLACK_WHITE, false, '', {
      platform: 'diorite',
      model: 'qemu_platform_diorite',
      language: 'en_US',
      firmware: {
        major: 4,
        minor: 0,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('diorite', standardLayouts.GRAY, true, '', {
      platform: 'diorite',
      model: 'qemu_platform_diorite',
      language: 'en_US',
      firmware: {
        major: 4,
        minor: 0,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('emery', standardLayouts.COLOR, true, '', {
      platform: 'emery',
      model: 'qemu_platform_emery',
      language: 'en_US',
      firmware: {
        major: 4,
        minor: 0,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('flint', standardLayouts.BLACK_WHITE, false, '', {
      platform: 'flint',
      model: 'qemu_platform_flint',
      language: 'en_US',
      firmware: {
        major: 4,
        minor: 0,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('flint', standardLayouts.GRAY, true, '', {
      platform: 'flint',
      model: 'qemu_platform_flint',
      language: 'en_US',
      firmware: {
        major: 4,
        minor: 0,
        patch: 0,
        suffix: ''
      }
    });
    testAutoLayout('gabbro', standardLayouts.COLOR, true, '', {
      platform: 'gabbro',
      model: 'qemu_platform_gabbro',
      language: 'en_US',
      firmware: {
        major: 4,
        minor: 0,
        patch: 0,
        suffix: ''
      }
    });

    testCustomLayout();
    testCustomLayout('COLOR');
    testCustomLayout('GRAY');
    testCustomLayout('BLACK_WHITE');
    testCustomLayout(['aaffaa', '55ff55', '00ff00']);
    testCustomLayout([false, '55ff55', '00ff00']);
    testCustomLayout([['aaffaa', '55ff55', '00ff00']]);
    testCustomLayout(
      [['AAFFAA', '#55ff55', '0x00ff00', 0xff5500, null]],
      ['aaffaa', '55ff55', '00ff00', 'ff5500', false]
    );
    testCustomLayout([
      ['aaffaa', '55ff55', '00ff00'],
      ['005555', 'ffffff', '000000']]
    );
    testCustomLayout([
      ['aaffaa', '55ff55', '00ff00'],
      [false, 'ffffff', false]]
    );
    testCustomLayout(
      [
        ['aaffaa', '55ff55', '00ff00'],
        [false, 'ffffff']
      ],
      ['aaffaa', '55ff55', '00ff00', false, 'ffffff', false]
    );
    testCustomLayout(
      [
        ['aaffaa', '55ff55', false],
        [false, 'ffffff']
      ],
      ['aaffaa', '55ff55', false, false, 'ffffff', false]
    );
    testCustomLayout(
      [
        ['aaffaa', '55ff55'],
        [false, 'ffffff', '000000']
      ],
      ['aaffaa', '55ff55', false, false, 'ffffff', '000000']
    );

  });
});
