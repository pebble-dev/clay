'use strict';

import configPageHtml = require('./tmp/config-page.html');
import standardComponents = require('./src/scripts/components');
function extractVersion(): string {
  const pkg: unknown = require('./package.json');
  if (typeof pkg === 'object' && pkg !== null && 'version' in pkg && typeof pkg.version === 'string') {
    return pkg.version;
  }
  return '';
}
const version = extractVersion();
import messageKeys = require('message_keys');

import { ClayConfigItem, ClayMeta } from './src/scripts/lib/types';

declare function toSource(obj: unknown): string;

import deepcopy = require('deepcopy/build/deepcopy.min');

interface PebbleObject {
  addEventListener(event: string, handler: (...args: unknown[]) => void): void;
  openURL(url: string): void;
  sendAppMessage(data: Record<string, unknown>, success?: () => void, failure?: (error: unknown) => void): void;
  getActiveWatchInfo?(): { platform: string; firmware: { major: number; minor: number } };
  getAccountToken(): string;
  getWatchToken(): string;
  platform?: string;
}

declare const Pebble: PebbleObject | undefined;
declare const localStorage: Storage;

interface ClayOptions {
  autoHandleEvents?: boolean;
  userData?: Record<string, unknown>;
}

interface ClayInstance {
  config: ClayConfigItem[];
  customFn: (this: unknown) => void;
  components: Record<string, unknown>;
  meta: ClayMeta;
  version: string;
  generateUrl(): string;
  getSettings(response: string, convert?: boolean): Record<string, unknown>;
  setSettings(key: string | Record<string, unknown>, value?: unknown): void;
  registerComponent(component: unknown): boolean;
}

/**
 * Initialise Clay with the given configuration
 * @param config - the Clay config
 * @param customFn - Custom code to run from the config page. Will run
 *   with the ClayConfig instance as context
 * @param options - Additional options to pass to Clay
 * @param options.autoHandleEvents - If false, Clay will not
 *   automatically handle the 'showConfiguration' and 'webviewclosed' events
 * @param options.userData - Arbitrary data to pass to the config page. Will
 *   be available as `clayConfig.meta.userData`
 */
function Clay(this: ClayInstance, config: ClayConfigItem[], customFn?: ((this: unknown) => void) | null, options?: ClayOptions): void {
  const self = this;

  if (!Array.isArray(config)) {
    throw new Error('config must be an Array');
  }

  if (customFn && typeof customFn !== 'function') {
    throw new Error('customFn must be a function or "null"');
  }

  const opts = options || {};

  self.config = deepcopy(config);
  self.customFn = customFn || function() {};
  self.components = {};
  self.meta = {
    activeWatchInfo: null,
    accountToken: '',
    watchToken: '',
    userData: {}
  };
  self.version = version;

  /**
   * Populate the meta with data from the Pebble object. Make sure to run this inside
   * either the "showConfiguration" or "ready" event handler
   */
  function _populateMeta(): void {
    self.meta = {
      activeWatchInfo: Pebble && Pebble.getActiveWatchInfo ? Pebble.getActiveWatchInfo() : null,
      accountToken: Pebble ? Pebble.getAccountToken() : '',
      watchToken: Pebble ? Pebble.getWatchToken() : '',
      userData: deepcopy(opts.userData || {})
    };
  }

  // Let Clay handle all the magic
  if (opts.autoHandleEvents !== false && typeof Pebble !== 'undefined') {

    Pebble.addEventListener('showConfiguration', function() {
      _populateMeta();
      Pebble.openURL(self.generateUrl());
    });

    Pebble.addEventListener('webviewclosed', function(e: unknown) {

      if (!e || typeof e !== 'object' || !('response' in e)) { return; }

      const response = e.response;

      if (typeof response !== 'string') { return; }

      // Send settings to Pebble watchapp
      Pebble.sendAppMessage(self.getSettings(response), function() {
        console.log('Sent config data to Pebble');
      }, function(error: unknown) {
        console.log('Failed to send config data!');
        console.log(JSON.stringify(error));
      });
    });
  } else if (typeof Pebble !== 'undefined') {
    Pebble.addEventListener('ready', function() {
      _populateMeta();
    });
  }

  /**
   * Scan over the config and run the callback if the testFn resolves to true
   */
  function _scanConfig(item: ClayConfigItem | ClayConfigItem[], testFn: (item: ClayConfigItem) => boolean, callback: (item: ClayConfigItem) => void): void {
    if (Array.isArray(item)) {
      item.forEach(function(item) {
        _scanConfig(item, testFn, callback);
      });
    } else if (item.type === 'section') {
      _scanConfig(item.items || [], testFn, callback);
    } else if (testFn(item)) {
      callback(item);
    }
  }

  // register standard components
  _scanConfig(self.config, function(item) {
    return item.type in standardComponents;
  }, function(item) {
    if (item.type in standardComponents) {
      self.registerComponent(standardComponents[item.type]);
    }
  });

  // validate config against the use of appKeys
  _scanConfig(self.config, function(item) {
    return !!item.appKey;
  }, function() {
    throw new Error('appKeys are no longer supported. ' +
                    'Please follow the migration guide to upgrade your project');
  });
}

/**
 * Register a component to Clay.
 * @param component - the clay component to register
 * @param component.name - the name of the component
 * @param component.template - HTML template to use for the component
 * @param component.manipulator - methods to attach to the component
 * @param component.manipulator.set - set manipulator method
 * @param component.manipulator.get - get manipulator method
 * @param component.defaults - template defaults
 * @param component.initialize - method to scaffold the component
 * @returns Returns true if component was registered correctly
 */
Clay.prototype.registerComponent = function(this: ClayInstance, component: unknown): boolean {
  if (typeof component === 'object' && component !== null && 'name' in component && typeof component.name === 'string') {
    this.components[component.name] = component;
    return true;
  }
  return false;
};

/**
 * Generate the Data URI used by the config Page with settings injected
 */
Clay.prototype.generateUrl = function(this: ClayInstance): string {
  let settings: Record<string, unknown> = {};
  const emulator = !Pebble || (Pebble && Pebble.platform === 'pypkjs');
  const returnTo = emulator ? '$$$RETURN_TO$$$' : 'pebblejs://close#';

  try {
    const stored = localStorage.getItem('clay-settings');
    settings = stored ? JSON.parse(stored) : {};
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.toString());
    }
  }

  const compiledHtml = configPageHtml
    .replace('$$RETURN_TO$$', returnTo)
    .replace('$$CUSTOM_FN$$', toSource(this.customFn))
    .replace('$$CONFIG$$', toSource(this.config))
    .replace('$$SETTINGS$$', toSource(settings))
    .replace('$$COMPONENTS$$', toSource(this.components))
    .replace('$$META$$', toSource(this.meta));

  // if we are in the emulator then we need to proxy the data via a webpage to
  // obtain the return_to.
  if (emulator) {
    return Clay.encodeDataUri(
      compiledHtml,
      'http://clay.pebble.com.s3-website-us-west-2.amazonaws.com/#'
    );
  }

  return Clay.encodeDataUri(compiledHtml);
};

/**
 * Parse the response from the webviewclosed event data
 */
Clay.prototype.getSettings = function(this: ClayInstance, response: string, convert?: boolean): Record<string, unknown> {
  // Decode and parse config data as JSON
  let settings: Record<string, unknown> = {};
  const decoded = response.match(/^\{/) ? response : decodeURIComponent(response);

  try {
    settings = JSON.parse(decoded);
  } catch (e) {
    throw new Error('The provided response was not valid JSON');
  }

  // flatten the settings for localStorage
  const settingsStorage: Record<string, unknown> = {};
  Object.keys(settings).forEach(function(key) {
    const val = settings[key];
    if (typeof val === 'object' && val !== null && 'value' in val) {
      settingsStorage[key] = val.value;
    } else {
      settingsStorage[key] = val;
    }
  });

  localStorage.setItem('clay-settings', JSON.stringify(settingsStorage));

  return convert === false ? settings : Clay.prepareSettingsForAppMessage(settings);
};

/**
 * Updates the settings with the given value(s).
 *
 * @signature `clay.setSettings(key, value)`
 * @param key - The property to set.
 * @param value - the value assigned to _key_.
 * @return undefined
 *
 * @signature `clay.setSettings(settings)`
 * @param key - an object containing the key/value pairs to be set.
 * @return undefined
 */
Clay.prototype.setSettings = function(this: ClayInstance, key: string | Record<string, unknown>, value?: unknown): void {
  let settingsStorage: Record<string, unknown> = {};

  try {
    const stored = localStorage.getItem('clay-settings');
    settingsStorage = stored ? JSON.parse(stored) : {};
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.toString());
    }
  }

  if (typeof key === 'object' && key !== null) {
    Object.keys(key).forEach(function(k) {
      settingsStorage[k] = key[k];
    });
  } else if (typeof key === 'string') {
    settingsStorage[key] = value;
  }

  localStorage.setItem('clay-settings', JSON.stringify(settingsStorage));
};

/**
 * Encode a string as a data URI
 */
Clay.encodeDataUri = function(input: string, prefix?: string): string {
  const finalPrefix = typeof prefix !== 'undefined' ? prefix : 'data:text/html;charset=utf-8,';
  return finalPrefix + encodeURIComponent(input);
};

/**
 * Converts the val into a type compatible with Pebble.sendAppMessage().
 *  - Strings will be returned without modification
 *  - Numbers will be returned without modification
 *  - Booleans will be converted to a 0 or 1
 *  - Arrays that contain strings will be returned without modification
 *    eg: ['one', 'two'] becomes ['one', 'two']
 *  - Arrays that contain numbers will be returned without modification
 *    eg: [1, 2] becomes [1, 2]
 *  - Arrays that contain booleans will be converted to a 0 or 1
 *    eg: [true, false] becomes [1, 0]
 *  - Arrays must be single dimensional
 *  - Objects that have a "value" property will apply the above rules to the type of
 *    value. If the value is a number or an array of numbers and the optional
 *    property: "precision" is provided, then the number will be multiplied by 10 to
 *    the power of precision (value * 10 ^ precision) and then floored.
 *    Eg: 1.4567 with a precision set to 3 will become 1456
 */
Clay.prepareForAppMessage = function(val: unknown): unknown {

  /**
   * Moves the decimal place of a number by precision then drop any remaining decimal
   * places.
   */
  function _normalizeToPrecision(number: number, precision?: number): number {
    return Math.floor(number * Math.pow(10, precision || 0));
  }

  if (Array.isArray(val)) {
    const resultArr: unknown[] = [];
    val.forEach(function(item, index) {
      resultArr[index] = Clay.prepareForAppMessage(item);
    });
    return resultArr;
  } else if (typeof val === 'object' && val !== null && !Array.isArray(val) && 'value' in val) {
    if (typeof val.value === 'number') {
      const precision = 'precision' in val && typeof val.precision === 'number' ? val.precision : undefined;
      return _normalizeToPrecision(val.value, precision);
    } else if (Array.isArray(val.value)) {
      const prec = 'precision' in val && typeof val.precision === 'number' ? val.precision : undefined;
      return val.value.map(function(item) {
        if (typeof item === 'number') {
          return _normalizeToPrecision(item, prec);
        }
        return item;
      });
    } else {
      return Clay.prepareForAppMessage(val.value);
    }
  } else if (typeof val === 'boolean') {
    return val ? 1 : 0;
  }

  return val;
};

/**
 * Converts a Clay settings dict into one that is compatible with
 * Pebble.sendAppMessage(); It also uses the provided messageKeys to correctly
 * assign arrays into individual keys
 */
Clay.prepareSettingsForAppMessage = function(settings: Record<string, unknown>): Record<string, unknown> {

  // flatten settings
  const flatSettings: Record<string, unknown> = {};
  Object.keys(settings).forEach(function(key) {
    const val = settings[key];
    const matches = key.match(/(.+?)(?:\[(\d*)\])?$/);

    if (!matches || !matches[2]) {
      flatSettings[key] = val;
      return;
    }

    const position = parseInt(matches[2], 10);
    const flatKey = matches[1];

    if (typeof flatSettings[flatKey] === 'undefined') {
      flatSettings[flatKey] = [];
    }

    const flatValue = flatSettings[flatKey];
    if (Array.isArray(flatValue)) {
      flatValue[position] = val;
    }
  });

  const result: Record<string, unknown> = {};
  Object.keys(flatSettings).forEach(function(key) {
    const messageKey = messageKeys[key];
    let settingArr = Clay.prepareForAppMessage(flatSettings[key]);
    const settingList = Array.isArray(settingArr) ? settingArr : [settingArr];

    settingList.forEach(function(setting, index) {
      result[messageKey + index] = setting;
    });
  });

  // validate the settings
  Object.keys(result).forEach(function(key) {
    if (Array.isArray(result[key])) {
      throw new Error('Clay does not support 2 dimensional arrays for item ' +
                      'values. Make sure you are not attempting to use array ' +
                      'syntax (eg: "myMessageKey[2]") in the messageKey for ' +
                      'components that return an array, such as a checkboxgroup');
    }
  });

  return result;
};

function createClay(
  config: ClayConfigItem[],
  customFn?: ((this: unknown) => void) | null,
  options?: ClayOptions
): ClayInstance {
  const instance: ClayInstance = Object.create(Clay.prototype);
  Clay.call(instance, config, customFn, options);
  return instance;
}

createClay.encodeDataUri = Clay.encodeDataUri;
createClay.prepareForAppMessage = Clay.prepareForAppMessage;
createClay.prepareSettingsForAppMessage = Clay.prepareSettingsForAppMessage;

export = createClay;
