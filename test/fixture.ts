'use strict';

import minified = require('../src/scripts/vendor/minified');
import createClayItem = require('../src/scripts/lib/clay-item');
import createClayConfig = require('../src/scripts/lib/clay-config');
import Clay = require('../index');
import components = require('../src/scripts/components');
import componentRegistry = require('../src/scripts/lib/component-registry');
import type { ClayConfigItem, ClayMeta, ClayComponentInput } from '../src/scripts/lib/types';

const _ = minified._;
const $ = minified.$;
const HTML = minified.HTML;

let idCounter = 0;

/**
 * Create a mock meta object, optionally extended with additional properties.
 */
function meta(extra?: Record<string, unknown>): ClayMeta & Record<string, unknown> {
  const result: ClayMeta & Record<string, unknown> = {
    accountToken: '0123456789abcdef0123456789abcdef',
    watchToken: '0123456789abcdef0123456789abcdef',
    activeWatchInfo: {
      platform: 'chalk',
      model: 'qemu_platform_chalk',
      language: 'en_US',
      firmware: {
        major: 3,
        minor: 3,
        patch: 2,
        suffix: ''
      }
    },
    userData: {}
  };

  _.eachObj(extra || {}, function(key: string, val: unknown) {
    result[key] = val;
  });

  return result;
}

/**
 * Create a config item, with auto-registration if needed.
 */
function configItem(config: string | ClayConfigItem, autoRegister?: boolean): ClayConfigItem {
  let resolvedConfig: ClayConfigItem;
  if (typeof config === 'string') {
    resolvedConfig = { type: config };
  } else {
    resolvedConfig = config;
  }

  const defaults: ClayConfigItem = {
    type: resolvedConfig.type,
    label: resolvedConfig.type + '-label',
    messageKey: 'messageKey-' + idCounter,
    id: 'id-' + idCounter
  };
  const result: ClayConfigItem = Object.assign(defaults, resolvedConfig);

  idCounter++;

  if (autoRegister !== false &&
      !(result.type in componentRegistry) &&
      result.type !== 'section' &&
      result.type in components) {
    createClayConfig.registerComponent(components[result.type]);
  }

  return result;
}

/**
 * Create a ClayItem from a config.
 */
function clayItem(config: string | ClayConfigItem, autoRegister?: boolean) {
  return createClayItem(configItem(config, autoRegister));
}

/**
 * Create a config array from types, recursively handling nested sections.
 */
function config(types: (string | ClayConfigItem | (string | ClayConfigItem)[])[], autoRegister?: boolean): ClayConfigItem[] {
  return types.map(function(item) {
    if (Array.isArray(item)) {
      return {
        type: 'section',
        items: config(item, autoRegister)
      };
    }
    return configItem(item, autoRegister);
  });
}

/**
 * Create a ClayConfig instance from types.
 */
function clayConfig(
  types?: (string | ClayConfigItem | (string | ClayConfigItem)[])[],
  build?: boolean,
  autoRegister?: boolean,
  settings?: Record<string, unknown>,
  metaOverride?: Record<string, unknown>
) {
  const clayConfigInstance = createClayConfig(
    settings || {},
    config(types || [], autoRegister),
    HTML('<div>'),
    meta(metaOverride)
  );
  return build === false ? clayConfigInstance : clayConfigInstance.build();
}

/**
 * Create a Clay instance with optional custom code and options.
 */
function clay(
  clayConfig: ClayConfigItem[],
  customFn?: ((this: unknown) => void) | null,
  options?: Record<string, unknown>,
  destroyLocalStorage?: boolean
) {
  if (destroyLocalStorage !== false) {
    localStorage.removeItem('clay-settings');
  }
  return Clay(clayConfig, customFn, options);
}

/**
 * Convert an array of message key identifiers to a map of key names to IDs.
 * Handles array notation like 'myKey[3]' to reserve space for arrays.
 */
function messageKeys(keys: string[]): Record<string, number> {
  let counter = 10000;
  const result: Record<string, number> = {};

  keys.forEach(function(key) {
    const matches = key.match(/(.+?)(?:\[(\d*)\])?$/);
    if (!matches) {
      return;
    }
    const parsedKey = matches[1];
    const length = parseInt(matches[2] || '1', 10);

    result[parsedKey] = counter;

    counter += length;
  });

  return result;
}

/**
 * Convert an object with arrays to message key notation.
 */
function messageKeysObjToArray(obj: Record<string, unknown>): string[] {
  return Object.keys(obj).map(function(key) {
    const val = obj[key];
    return Array.isArray(val) ?
      key + '[' + val.length + ']' :
      key;
  });
}

/**
 * Convert expected values object to message key map.
 */
function messageKeysExpected(expected: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let messageKeysArray = messageKeysObjToArray(expected);
  const messageKeysMap = messageKeys(messageKeysArray);

  Object.keys(expected).forEach(function(key) {
    const expectedVal = Array.isArray(expected[key]) ? expected[key] : [expected[key]];
    if (!Array.isArray(expectedVal)) {
      return;
    }
    expectedVal.forEach(function(val, index) {
      if (typeof val !== 'undefined') {
        result[messageKeysMap[key] + index] = val;
      }
    });
  });

  return result;
}

export = {
  meta,
  configItem,
  clayItem,
  config,
  clayConfig,
  clay,
  messageKeys,
  messageKeysObjToArray,
  messageKeysExpected
};
