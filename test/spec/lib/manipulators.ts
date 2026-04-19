'use strict';

import { assert } from 'chai';
import sinon = require('sinon');
import fixture = require('../../fixture');
import type { ClayConfigItem } from '../../../src/scripts/lib/types';

describe('manipulators', function() {

  /**
   * @param {string|Object} itemType
   * @param {*} value
   * @param {*} [expected]
   * @return {void}
   */
  function testSetGet(itemType: string | ClayConfigItem, value: unknown, expected?: unknown): void {
    const expectedVal = typeof expected === 'undefined' ? value : expected;

    describe('.set() and .get()', function() {
      it('sets: "' + value + '" and gets: "' + expectedVal + '" then triggers "change"',
      function() {
        const handlerSpy = sinon.spy();
        const clayItem = fixture.clayConfig([itemType]).getAllItems()[0];
        clayItem.on('change', handlerSpy);

        clayItem.set(value);
        clayItem.set(value);
        assert.deepEqual(clayItem.get(), expectedVal);
        assert.strictEqual(handlerSpy.callCount, 1, 'handler not called once');
        assert(handlerSpy.calledOn(clayItem), 'handler not called on clayItem');
      });
    });
  }

  /**
   * @param {string|Object} itemType
   * @return {void}
   */
  function testDisable(itemType: string | ClayConfigItem): void {
    describe('.disable()', function() {
      it('disables the field then triggers a "disabled" event', function() {
        const handlerSpy = sinon.spy();
        const clayItem = fixture.clayItem(itemType);
        clayItem.on('disabled', handlerSpy);
        assert.strictEqual(
          clayItem.$element[0].classList.contains('disabled'),
          false
        );
        clayItem.disable?.();
        clayItem.disable?.();
        assert.strictEqual(
          clayItem.$element[0].classList.contains('disabled'),
          true
        );
        assert.strictEqual(clayItem.$manipulatorTarget.get('disabled'), true);
        assert.strictEqual(handlerSpy.callCount, 1, 'handler not called once');
        assert(handlerSpy.calledOn(clayItem), 'handler not called on clayItem');
      });
    });
  }

  /**
   * @param {string|Object} itemType
   * @return {void}
   */
  function testEnable(itemType: string | ClayConfigItem): void {
    describe('.enable()', function() {
      it('enables the field then triggers an "enabled" event', function() {
        const handlerSpy = sinon.spy();
        const clayItem = fixture.clayItem(itemType);
        clayItem.on('enabled', handlerSpy);

        clayItem.disable?.();
        assert.strictEqual(
          clayItem.$element[0].classList.contains('disabled'),
          true
        );
        clayItem.enable?.();
        clayItem.enable?.();
        assert.strictEqual(
          clayItem.$element[0].classList.contains('disabled'),
          false
        );
        assert.strictEqual(clayItem.$manipulatorTarget.get('disabled'), false);
        assert.strictEqual(handlerSpy.callCount, 1, 'handler not called once');
        assert(handlerSpy.calledOn(clayItem), 'handler not called on clayItem');
      });
    });
  }

  /**
   * @param {string|Object} itemType
   * @return {void}
   */
  function testHide(itemType: string | ClayConfigItem): void {
    describe('.hide()', function() {
      it('hides the field then triggers a "hide" event', function() {
        const handlerSpy = sinon.spy();
        const clayItem = fixture.clayItem(itemType);
        clayItem.on('hide', handlerSpy);

        assert.strictEqual(
          clayItem.$element[0].classList.contains('hide'),
          false
        );
        clayItem.hide?.();
        clayItem.hide?.();
        assert.strictEqual(
          clayItem.$element[0].classList.contains('hide'),
          true
        );
        assert.strictEqual(handlerSpy.callCount, 1, 'handler not called once');
        assert(handlerSpy.calledOn(clayItem), 'handler not called on clayItem');
      });
    });
  }

  /**
   * @param {string|Object} itemType
   * @return {void}
   */
  function testShow(itemType: string | ClayConfigItem): void {
    describe('.show()', function() {
      it('shows the field then triggers a "show" event', function() {
        const handlerSpy = sinon.spy();
        const clayItem = fixture.clayItem(itemType);
        clayItem.on('show', handlerSpy);

        clayItem.hide?.();
        assert.strictEqual(
          clayItem.$element[0].classList.contains('hide'),
          true
        );
        clayItem.show?.();
        clayItem.show?.();
        assert.strictEqual(
          clayItem.$element[0].classList.contains('hide'),
          false
        );
        assert.strictEqual(handlerSpy.callCount, 1, 'handler not called once');
        assert(handlerSpy.calledOn(clayItem), 'handler not called on clayItem');
      });
    });
  }

  describe('html', function() {
    const type = 'text';
    testSetGet(type, 'test123');
    testSetGet(type, '<span>some HTML</span>');
    testShow(type);
    testHide(type);
  });

  describe('button', function() {
    const type = 'button';
    testSetGet(type, 'test123');
    testSetGet(type, '<span>some HTML</span>');
    testDisable(type);
    testEnable(type);
    testShow(type);
    testHide(type);
  });

  describe('val', function() {
    const type = 'input';
    testSetGet(type, 'test321');
    testSetGet(type, 1234, '1234');
    testDisable(type);
    testEnable(type);
    testShow(type);
    testHide(type);
  });

  describe('slider', function() {
    const type: ClayConfigItem = {
      type: 'slider',
      min: 0,
      max: 100,
      step: 0.1
    };

    testSetGet(type, '12', 12);
    testSetGet(type, 12);
    testSetGet(type, '12.3', 12.3);
    testSetGet(type, 12.3);
    testSetGet(type, 12.34, 12.3);
    testSetGet(type, '12.34', 12.3);
    testDisable(type);
    testEnable(type);
    testShow(type);
    testHide(type);
  });

  describe('checked', function() {
    const type = 'toggle';
    testSetGet({type: type, defaultValue: false}, 1, true);
    testSetGet({type: type, defaultValue: false}, true);
    testSetGet({type: type, defaultValue: true}, 0, false);
    testSetGet({type: type, defaultValue: true}, false);
    testDisable(type);
    testEnable(type);
    testShow(type);
    testHide(type);
  });

  describe('radiogroup', function() {
    const type: ClayConfigItem = {
      type: 'radiogroup',
      clayId: 1,
      options: [
        { label: '1', value: 'one' },
        { label: '2', value: 'two' },
        { label: '3', value: 'three "quote' }
      ]
    };
    testSetGet(type, 'one');
    testSetGet(type, 'two');
    testSetGet(type, 'three "quote');
    testDisable(type);
    testEnable(type);
    testShow(type);
    testHide(type);
  });

  describe('checkboxgroup', function() {
    const type = {
      type: 'checkboxgroup',
      clayId: 1,
      defaultValue: [true, true, true],
      options: ['First', 'Second', 'Third']
    } as unknown as ClayConfigItem;
    testSetGet(type, [false, false, true]);
    testSetGet(type, [true, false], [true, false, false]);
    testSetGet(type, [1, 0], [true, false, false]);
    testSetGet(type, [true], [true, false, false]);
    testSetGet(type, [1], [true, false, false]);
    testSetGet(type, [], [false, false, false]);

    // any non-array values should result in all false
    testSetGet(type, false, [false, false, false]);
    testSetGet(type, true, [false, false, false]);
    testSetGet(type, null, [false, false, false]);
    testDisable(type);
    testEnable(type);
    testShow(type);
    testHide(type);
  });

  describe('color', function() {
    const type = 'color';
    testSetGet(type, 'FF0000', 0xff0000);
    testSetGet(type, '#FF0000', 0xff0000);
    testSetGet(type, '0xFF0000', 0xff0000);
    testSetGet(type, '#ff0000', 0xff0000);
    testSetGet(type, 0xff0000, 0xff0000);
    testSetGet({type: type, defaultValue: 0x00ff00}, '', 0x000000);
    testSetGet({type: type, defaultValue: 0x00ff00}, false, 0x000000);
    testSetGet({type: type, defaultValue: 0x00ff00}, undefined, 0x000000);
    testDisable(type);
    testEnable(type);
    testShow(type);
    testHide(type);
  });
});
