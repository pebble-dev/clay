'use strict';

import { assert } from 'chai';
import sinon = require('sinon');
import testUtils = require('../../test-utils');
import createClayItem = require('../../../src/scripts/lib/clay-item');
import minified = require('../../../src/scripts/vendor/minified');
import fixture = require('../../fixture');
import componentRegistry = require('../../../src/scripts/lib/component-registry');

describe('ClayItem', function(): void {
  it('defines read-only properties', function(): void {
    const properties = [
      'id',
      'messageKey',
      'config',
      '$element',
      '$manipulatorTarget',
      'on',
      'off',
      'trigger',
      'initialize'
    ];
    const clayItem = fixture.clayItem('input');
    testUtils.checkReadOnly(clayItem, properties);
  });

  it('attaches the manipulator methods', function(): void {
    Object.keys(componentRegistry).forEach(function(itemName: string): void {
      const clayItem = fixture.clayItem(itemName);
      const manipulator = componentRegistry[itemName].manipulator;
      testUtils.checkReadOnly(clayItem, Object.keys(manipulator));
    });
  });

  it('throws if a component is not in the registry', function(): void {
    const config = fixture.configItem('fake', false);
    /* eslint-disable no-new */
    assert.throws(function(): void { createClayItem(config); }, /fake/);
    /* eslint-enable no-new */
  });

  describe('.id', function(): void {
    it('sets id if config has id', function(): void {
      const config = fixture.configItem('input');
      const clayItem = createClayItem(config);
      assert.strictEqual(clayItem.id, config.id);
    });

    it('sets id to null if there is no id in the config', function(): void {
      const clayItem = fixture.clayItem({type: 'input', id: undefined});
      assert.strictEqual(clayItem.id, null);
    });
  });

  describe('.messageKey', function(): void {
    it('sets messageKey correctly', function(): void {
      const config = fixture.configItem('input');
      const clayItem = createClayItem(config);
      assert.strictEqual(clayItem.messageKey, config.messageKey);
    });

    it('sets messageKey to null if there is no messageKey in the config',
    function(): void {
      const clayItem = fixture.clayItem({type: 'input', messageKey: undefined});
      assert.strictEqual(clayItem.messageKey, null);
    });
  });

  describe('.config', function(): void {
    it('sets messageKey correctly', function(): void {
      const config = fixture.configItem('input');
      const clayItem = createClayItem(config);
      assert.strictEqual(clayItem.messageKey, config.messageKey);
    });
  });

  describe('.$element', function(): void {
    it('sets $element correctly', function(): void {
      const clayItem = fixture.clayItem('input');
      assert.strictEqual(clayItem.$element[0].classList.contains('component'), true);
    });
  });

  describe('.$manipulatorTarget', function(): void {
    it('sets the $manipulatorTarget to the root element if there are no children',
    function(): void {
      const clayItem = fixture.clayItem('footer');
      assert.strictEqual(clayItem.$manipulatorTarget, clayItem.$element);
    });
    it('sets the $manipulatorTarget to the correct child element', function(): void {
      const clayItem = fixture.clayItem('input');
      assert.strictEqual(clayItem.$manipulatorTarget[0].tagName, 'INPUT');
    });
  });

  describe('.initialize()', function(): void {
    it('calls component initializer  with the ClayItem as context', function(): void {
      const initializeSpy = sinon.spy(componentRegistry.select, 'initialize');
      const clayConfig = fixture.clayConfig(['select']);
      assert(initializeSpy.alwaysCalledOn(clayConfig.getItemsByType('select')[0]));
      assert(initializeSpy.alwaysCalledWith(minified, clayConfig));
      initializeSpy.restore();
    });

    it('returns itself for chaining', function(): void {
      const clayItem = fixture.clayItem('select');
      const clayConfig = fixture.clayConfig([]);
      assert.strictEqual(clayItem.initialize(clayConfig), clayItem);
    });

    it('does nothing if there is no initialize function', function(): void {
      assert.doesNotThrow(function(): void {
        fixture.clayItem('input').initialize(fixture.clayConfig([]));
      });
    });
  });

});
