'use strict';

import fixture = require('../fixture');
import Clay = require('../../index');
import { assert } from 'chai';
import standardComponents = require('../../src/scripts/components');
import sinon = require('sinon');

declare function toSource(obj: unknown): string;

declare const global: Record<string, unknown>;

interface SinonStubbed {
  callCount: number;
  called: boolean;
  calledWith(...args: unknown[]): boolean;
  calledWithMatch(...args: unknown[]): boolean;
  withArgs(...args: unknown[]): sinon.SinonStub;
  callArg(index: number): unknown;
  callArgWith(index: number, ...args: unknown[]): unknown;
  getCall(index: number): sinon.SinonSpyCall | null;
  restore(): void;
  returns(value: unknown): sinon.SinonStub;
}

interface MockPebble {
  addEventListener: SinonStubbed;
  openURL: SinonStubbed;
  sendAppMessage: SinonStubbed;
  getActiveWatchInfo: SinonStubbed;
  getAccountToken: SinonStubbed;
  getWatchToken: SinonStubbed;
  platform?: string;
}

/**
 * @return {void}
 */
function stubPebble(): void {
  const meta = fixture.meta();

  const mockPebble: MockPebble = {
    addEventListener: sinon.stub(),
    openURL: sinon.stub(),
    sendAppMessage: sinon.stub(),
    getActiveWatchInfo: sinon.stub().returns(meta.activeWatchInfo),
    getAccountToken: sinon.stub().returns(meta.accountToken),
    getWatchToken: sinon.stub().returns(meta.watchToken)
  };

  global.Pebble = mockPebble;
}

/**
 * @param {Array} keys
 * @return {Object}
 */
function stubMessageKeys(keys: unknown[]): Record<string, unknown> {
  const messageKeys: unknown = require('message_keys');
  const keyList: string[] = [];
  keys.forEach(function(key: unknown) {
    if (typeof key === 'string') {
      keyList.push(key);
    }
  });

  if (typeof messageKeys === 'object' && messageKeys !== null) {
    Object.keys(messageKeys as Record<string, unknown>).forEach(function(key: string) {
      delete (messageKeys as Record<string, unknown>)[key];
    });

    const newKeys = fixture.messageKeys(keyList);
    Object.keys(newKeys).forEach(function(key: string) {
      (messageKeys as Record<string, unknown>)[key] = (newKeys as Record<string, unknown>)[key];
    });
  }

  return messageKeys as Record<string, unknown>;
}

describe('Clay', function() {
  describe('Clay constructor', function() {
    it('throws if the config is not an array', function() {
      assert.throws(function() {
        fixture.clay({} as any);
      }, /must be an Array/i);
    });

    it('throws if the config contains appKeys', function() {
      assert.throws(function() {
        fixture.clay([
          {type: 'input', appKey: 'foo'},
          {type: 'someCustomComponent', appKey: 'bar'}
        ]);
      }, /appKeys are no longer supported/i);
    });

    it('throws if customFn is not a function', function() {
      assert.throws(function() {
        fixture.clay([], {} as any);
      }, /must be a function/i);
    });

    it('does not throw if customFn is undefined or a function', function() {
      assert.doesNotThrow(function() {
        fixture.clay([], function() {});
      });

      assert.doesNotThrow(function() {
        fixture.clay([]).customFn();
      });
    });

    it('registers the standard components present in the config', function() {
      const config = fixture.config(
        ['input', 'input', 'select', 'custom', ['color']],
        false
      );
      const clay = fixture.clay(config);
      assert.deepEqual(clay.components, {
        input: standardComponents['input'],
        select: standardComponents['select'],
        color: standardComponents['color']
      });
    });

    it('handles the "showConfiguration" event if autoHandleEvents is not false',
    function() {
      stubPebble();
      const clay = fixture.clay([]);

      // we stub the generateUrl method to avoid very large string comparisons.
      const generateUrlStub = sinon.stub(clay, 'generateUrl');
      generateUrlStub.returns('data:text/html;base64,PGh0bWw%2BVEVTVDwvaHRtbD4%3D');
      const pebble = global.Pebble as MockPebble;
      pebble.addEventListener.withArgs('showConfiguration').callArg(1);

      assert(pebble.addEventListener.calledWith('showConfiguration'));
      assert(pebble.openURL.calledWith(clay.generateUrl()));
      generateUrlStub.restore();
    });

    it('handles the "webviewclosed" event if autoHandleEvents is not false',
    function() {
      stubPebble();
      fixture.clay([]);
      const logStub = sinon.stub(console, 'log');
      const expected = {someSetting: 'value'};

      stubMessageKeys(fixture.messageKeysObjToArray(expected));
      const pebble = global.Pebble as MockPebble;
      pebble.addEventListener
        .withArgs('webviewclosed')
        .callArgWith(1, {response: encodeURIComponent(JSON.stringify(expected))});

      const expectedAppMessage = fixture.messageKeysExpected(expected);
      assert(pebble.addEventListener.calledWith('webviewclosed'));
      assert(pebble.sendAppMessage.calledWith(expectedAppMessage));

      pebble.sendAppMessage.callArg(1);
      assert(logStub.calledWith('Sent config data to Pebble'));

      pebble.sendAppMessage.callArgWith(2, {some: 'error'});
      assert(logStub.calledWith('Failed to send config data!'));
      assert(logStub.calledWith('{"some":"error"}'));

      logStub.restore();
    });

    it('handles an empty response in the "webviewclosed" handler', function() {
      stubPebble();
      fixture.clay([]);
      const pebble = global.Pebble as MockPebble;
      pebble.addEventListener.withArgs('webviewclosed').callArgWith(1, undefined);

      assert(pebble.addEventListener.calledWith('webviewclosed'));
      assert.strictEqual(pebble.sendAppMessage.callCount, 0);
    });

    it('does not handle the "webviewclosed" or "showConfiguration" events ' +
       'if autoHandleEvents is false', function() {
      stubPebble();
      fixture.clay([], undefined, { autoHandleEvents: false });
      const pebble = global.Pebble as MockPebble;
      assert.strictEqual(
        pebble.addEventListener.withArgs('webviewclosed').called,
        false
      );
      assert.strictEqual(
        pebble.addEventListener.withArgs('showConfiguration').called,
        false
      );
    });
  });

  describe('.version', function() {
    it('has the correct version', function() {
      const config = fixture.config(['input', 'text', 'color']);
      const clay = fixture.clay(config);
      const pkg: unknown = require('../../package.json');
      if (typeof pkg === 'object' && pkg !== null && 'version' in pkg && typeof pkg.version === 'string') {
        assert.strictEqual(clay.version, pkg.version);
      }
    });
  });

  describe('.config', function() {
    it('is a copy not a reference', function() {
      const config = fixture.config(['input', 'text', 'color']);
      const clay = fixture.clay(config);
      assert.notStrictEqual(clay.config, config);
      assert.deepEqual(clay.config, config);
    });
  });

  describe('.registerComponent()', function() {
    it('adds the component to the this.components', function() {
      const clay = fixture.clay([]);
      const customComponent = {
        name: 'custom',
        template: '<div></div>',
        manipulator: 'val'
      };
      clay.registerComponent(customComponent);
      assert.strictEqual((clay.components as Record<string, unknown>)[customComponent.name], customComponent);
    });
  });

  describe('.generateUrl()', function() {

    /**
     * Decode the generated data URI into just the HTML portion
     * @param {string} url
     * @returns {string}
     */
    function decodeUrl(url: string): string {
      return decodeURIComponent(url.replace(/^.*?[#,]/, ''));
    }

    describe('string substitutions', function() {
      const customFn = function(this: unknown) {
        const self = this as Record<string, unknown>;
        if (typeof self.getAllItems === 'function') {
          self.getAllItems();
        }
      };
      const config = fixture.config(['input', 'color']);
      const settings = { messageKey: 'value' };
      let clay: ReturnType<typeof fixture.clay>;
      let html: string;

      before(function() {
        stubPebble();
        clay = fixture.clay(config, customFn);
        const pebble = global.Pebble as MockPebble;
        pebble.addEventListener.withArgs('showConfiguration').callArg(1);
        localStorage.setItem('clay-settings', JSON.stringify(settings));
        html = decodeUrl(clay.generateUrl());
      });

      it('Substitutes $$RETURN_TO$$ with the pebblejs://close#', function() {
        assert.notInclude(html, '$$RETURN_TO$$');
        assert.include(html, 'window.returnTo="pebblejs://close#"');
      });

      it('Substitutes $$CUSTOM_FN$$ with the customFn', function() {
        assert.notInclude(html, '$$CUSTOM_FN$$');
        assert.include(html, 'window.customFn=' + toSource(customFn));
      });

      it('Substitutes $$CONFIG$$ with the config', function() {
        assert.notInclude(html, '$$CONFIG$$');
        assert.include(html, 'window.clayConfig=' + toSource(config));
      });

      it('Substitutes $$SETTINGS$$ with the config', function() {
        assert.notInclude(html, '$$SETTINGS$$');
        assert.include(html, 'window.claySettings=' + toSource(settings));
      });

      it('Substitutes $$COMPONENTS$$ with the config', function() {
        assert.notInclude(html, '$$COMPONENTS$$');
        assert.include(html, 'window.clayComponents=' + toSource(clay.components));
      });

      it('Substitutes $$META$$ with the config', function() {
        assert.notInclude(html, '$$META$$');
        assert.include(html, 'window.clayMeta=' + toSource(clay.meta));
      });
    });

    it('does not replace $$RETURN_TO$$ if in the emulator', function() {
      const clay = fixture.clay([]);
      stubPebble();
      const pebble = global.Pebble as MockPebble;
      pebble.platform = 'pypkjs';
      assert.match(decodeUrl(clay.generateUrl()), /\$\$RETURN_TO\$\$/);
    });

    it('returns the emulator URL if inside emulator', function() {
      const clay = fixture.clay([]);
      stubPebble();
      const pebble = global.Pebble as MockPebble;
      pebble.platform = 'pypkjs';
      assert.match(
        clay.generateUrl(),
        /^http:\/\/clay\.pebble\.com\.s3-website-us-west-2\.amazonaws.com\/#/
      );
    });

    it('doesn\'t throw and logs an error if settings in localStorage are broken',
    function() {
      const clay = fixture.clay([]);
      const errorStub = sinon.stub(console, 'error');
      localStorage.setItem('clay-settings', 'not valid JSON');
      assert.doesNotThrow(function() {
        clay.generateUrl();
      });
      assert(errorStub.calledWithMatch(/SyntaxError/i));
      errorStub.restore();
    });
  });

  describe('.getSettings', function() {
    it('it writes to localStorage and returns the data when input is encoded',
    function() {
      const clay = fixture.clay([]);
      const settings = encodeURIComponent(JSON.stringify({
        key1: 'value1',
        key2: {value: 'value2'}
      }));
      const expected = {
        key1: 'value1',
        key2: 'value2'
      };

      stubMessageKeys(fixture.messageKeysObjToArray(expected));

      const result = clay.getSettings(settings);
      assert.equal(
        localStorage.getItem('clay-settings'),
        JSON.stringify(expected)
      );
      assert.deepEqual(result, fixture.messageKeysExpected(expected));
    });

    it('it writes to localStorage and returns the data when input is not encoded',
    function() {
      const clay = fixture.clay([]);
      const settings = JSON.stringify({
        key1: 'value1',
        key2: {value: 'value2%7Dbreaks'}
      });
      const expected = {
        key1: 'value1',
        key2: 'value2%7Dbreaks'
      };

      stubMessageKeys(fixture.messageKeysObjToArray(expected));

      const result = clay.getSettings(settings);
      assert.equal(
        localStorage.getItem('clay-settings'),
        JSON.stringify(expected)
      );
      assert.deepEqual(result, fixture.messageKeysExpected(expected));
    });

    it('does not store the response if it is invalid JSON and logs an error',
    function() {
      const clay = fixture.clay([]);
      localStorage.setItem('clay-settings', '{"messageKey":"value"}');

      assert.throws(function() {
        clay.getSettings('not valid JSON');
      }, /Not Valid JSON/i);
      assert.equal(localStorage.getItem('clay-settings'), '{"messageKey":"value"}');
    });

    it('Prepares the settings for sendAppMessage', function() {
      const clay = fixture.clay([]);
      const response = encodeURIComponent(JSON.stringify({
        test1: false,
        test2: 'val-2',
        test3: true,
        test4: ['cb-1', 'cb-3'],
        test5: 12345,
        test6: [1, 2, 3, 4],
        test7: [true, false, true],
        test8: {
          precision: 2,
          value: 12.34
        },
        test9: {
          precision: 1,
          value: [1, 2, 3, 4]
        }
      }));
      const expected = {
        test1: 0,
        test2: 'val-2',
        test3: 1,
        test4: ['cb-1', 'cb-3'],
        test5: 12345,
        test6: [1, 2, 3, 4],
        test7: [1, 0, 1],
        test8: 1234,
        test9: [10, 20, 30, 40]
      };

      stubMessageKeys(fixture.messageKeysObjToArray(expected));

      assert.deepEqual(
        clay.getSettings(response),
        fixture.messageKeysExpected(expected)
      );
    });

    it('does not prepare the settings for sendAppMessage if convert is false',
    function() {
      const clay = fixture.clay([]);
      const settings = {
        test1: false,
        test2: 'val-2',
        test3: true,
        test4: ['cb-1', 'cb-3'],
        test5: 12345,
        test6: [1, 2, 3, 4],
        test7: [true, false, true],
        test8: {
          precision: 2,
          value: 12.34
        }
      };
      const response = encodeURIComponent(JSON.stringify(settings));

      assert.deepEqual(clay.getSettings(response, false), settings);
    });
  });

  describe('.setSettings', function() {
    it('it writes to localStorage when passing an object',
      function() {
        const clay = fixture.clay([]);
        const settings = {
          key1: 'value1',
          key2: 'value2'
        };
        const expected = {
          key1: 'value1',
          key2: 'value2'
        };

        clay.setSettings(settings);
        assert.equal(
          localStorage.getItem('clay-settings'),
          JSON.stringify(expected)
        );
      });

    it('it writes to localStorage when passing a key and a value',
      function() {
        const clay = fixture.clay([]);
        const expected = {
          key1: 'value1',
          key2: 'value2%7Dbreaks'
        };

        clay.setSettings('key1', 'value1');
        clay.setSettings('key2', 'value2%7Dbreaks');
        assert.equal(localStorage.getItem('clay-settings'),
          JSON.stringify(expected)
        );
      });

    it('doesn\'t throw and logs an error if settings in localStorage are broken',
      function() {
        const clay = fixture.clay([]);
        const errorStub = sinon.stub(console, 'error');
        localStorage.setItem('clay-settings', 'not valid JSON');
        assert.doesNotThrow(function() {
          clay.setSettings('key', 'value');
        });
        assert(errorStub.calledWithMatch(/SyntaxError/i));
        errorStub.restore();
      });
  });

  describe('.meta', function() {
    const emptyMeta = {
      activeWatchInfo: null,
      accountToken: '',
      watchToken: '',
      userData: {}
    };

    it('populates the meta in the showConfiguration handler', function() {
      stubPebble();
      const userData = {foo: 'bar'};
      const clay = fixture.clay([], undefined, {userData: userData});

      // meta only gets populated after showConfiguration happens
      assert.deepEqual(clay.meta, emptyMeta);
      const pebble = global.Pebble as MockPebble;
      pebble.addEventListener.withArgs('showConfiguration').callArg(1);
      assert.deepEqual(clay.meta, fixture.meta({userData: userData}));
    });

    it('populates the meta in the ready handler', function() {
      stubPebble();
      const userData = {foo: 'bar'};
      const clay = fixture.clay([], undefined, {
        autoHandleEvents: false,
        userData: userData
      });

      // meta only gets populated after ready happens
      assert.deepEqual(clay.meta, emptyMeta);
      const pebble = global.Pebble as MockPebble;
      pebble.addEventListener.withArgs('ready').callArg(1);

      assert.deepEqual(clay.meta, fixture.meta({userData: userData}));
    });

    it('populates the meta with with empty values when there is no Pebble global',
    function() {
      delete (global as Record<string, unknown>).Pebble;
      const clay = fixture.clay([], undefined, {autoHandleEvents: false});

      assert.deepEqual(clay.meta, emptyMeta);
    });
  });

  describe('Clay.encodeDataUri()', function() {
    it('adds the correct prefix', function() {
      assert.equal(Clay.encodeDataUri('<test>', 'prefix:'), 'prefix:%3Ctest%3E');
      assert.equal(
        Clay.encodeDataUri('<test>'),
        'data:text/html;charset=utf-8,%3Ctest%3E'
      );
    });

    it('encodes the data correctly', function() {
      assert.equal(Clay.encodeDataUri('test', ''), 'test');
      assert.equal(Clay.encodeDataUri('test{2}', ''), 'test%7B2%7D');
      assert.equal(Clay.encodeDataUri('test{10}', ''), 'test%7B10%7D');
    });

    it('does not throw if unicode character is provided', function() {
      assert.doesNotThrow(function() {
        Clay.encodeDataUri('♥');
      });
    });
  });

  describe('.prepareForAppMessage', function() {
    it('converts an array correctly when array contains strings', function() {
      assert.deepEqual(
        Clay.prepareForAppMessage(['one', 'two', 'three']),
        ['one', 'two', 'three']
      );
      assert.deepEqual(
        Clay.prepareForAppMessage([{value: 'one'}, 'two', 'three']),
        ['one', 'two', 'three']);
    });

    it('converts an array correctly when array contains numbers', function() {
      assert.deepEqual(Clay.prepareForAppMessage([1, 2, 3]), [1, 2, 3]);
      assert.deepEqual(Clay.prepareForAppMessage(
        {value: [1.5, 2.34, 3], precision: 2}),
        [150, 234, 300]
      );
    });

    it('converts an array correctly when array contains booleans', function() {
      assert.deepEqual(Clay.prepareForAppMessage([true, false, true]), [1, 0, 1]);
      assert.deepEqual(
        Clay.prepareForAppMessage([{value: true}, false, true]),
        [1, 0, 1]);
    });

    it('converts booleans to ints', function() {
      assert.strictEqual(Clay.prepareForAppMessage(false), 0);
      assert.strictEqual(Clay.prepareForAppMessage(true), 1);
      assert.strictEqual(Clay.prepareForAppMessage({value: false}), 0);
      assert.strictEqual(Clay.prepareForAppMessage({value: true}), 1);
    });

    it('leaves strings alone', function() {
      assert.strictEqual(Clay.prepareForAppMessage('test'), 'test');
      assert.strictEqual(Clay.prepareForAppMessage({value: 'test'}), 'test');
    });

    it('Multiples the number by the precision', function() {
      assert.strictEqual(Clay.prepareForAppMessage(123), 123);
      assert.strictEqual(Clay.prepareForAppMessage({
        value: 1.23,
        precision: 3
      }), 1230);
      assert.strictEqual(Clay.prepareForAppMessage({
        value: 123,
        precision: 2
      }), 12300);
      assert.strictEqual(Clay.prepareForAppMessage({
        value: 1.23456,
        precision: 4
      }), 12345);
    });

    it('ignores precision for anything but numbers', function() {
      assert.strictEqual(Clay.prepareForAppMessage({
        value: 'not a number',
        precision: 3
      }), 'not a number');

      assert.deepEqual(Clay.prepareForAppMessage({
        value: ['not', 'a', 'number'],
        precision: 3
      }), ['not', 'a', 'number']);
    });

    it('treats an undefined precision as 0', function() {
      assert.strictEqual(Clay.prepareForAppMessage({
        value: 12.45,
        precision: undefined
      }), 12);
    });

    it('Handles sparse arrays', function() {
      const sparseArr: Record<number, string> = {};
      sparseArr[1] = 'two';
      sparseArr[2] = 'three';
      assert.deepEqual(Clay.prepareForAppMessage(sparseArr), sparseArr);
    });
  });

  describe('.prepareSettingsForAppMessage', function() {
    it('converts the settings correctly', function() {
      const settings = {
        test1: false,
        'test2[0]': 'val-1',
        'test2[1]': 'val-2',
        test3: true,
        test4: ['cb-1', 'cb-3'],
        test5: 12345,
        test6: [1, 2, 3, 4],
        test7: [true, false, true],
        test8: {
          precision: 2,
          value: 12.34
        },
        'test9[1]': 'foo'
      };

      const expected = {
        test1: 0,
        test2: ['val-1', 'val-2'],
        test3: 1,
        test4: ['cb-1', 'cb-3'],
        test5: 12345,
        test6: [1, 2, 3, 4],
        test7: [1, 0, 1],
        test8: 1234,
        test9: [undefined, 'foo']
      };

      stubMessageKeys(fixture.messageKeysObjToArray(expected));

      const result = Clay.prepareSettingsForAppMessage(settings);

      assert.deepEqual(result, fixture.messageKeysExpected(expected));
    });

    it('throws if a 2 dimension array is present', function() {
      const settings = {
        'test1[1]': ['bad', 'developer!']
      };

      stubMessageKeys(['test1[2]']);

      assert.throws(function() {
        Clay.prepareSettingsForAppMessage(settings);
      }, /2 dimensional array/i);
    });
  });
});
