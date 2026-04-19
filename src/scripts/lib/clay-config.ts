'use strict';

import minified = require('../vendor/minified');
const HTML = minified.HTML;
const _ = minified._;

import ClayItem = require('./clay-item');
import utils = require('../lib/utils');
import ClayEvents = require('./clay-events');
import componentStore = require('./component-registry');
import manipulators = require('./manipulators');

interface ClayConfigItem {
  type: string;
  defaultValue?: string | boolean | number;
  messageKey?: string;
  id?: string;
  label?: string;
  attributes?: Record<string, unknown>;
  options?: unknown[];
  items?: ClayConfigItem[];
  capabilities?: string[];
  group?: string;
  clayId?: number;
}

interface ClayMeta {
  activeWatchInfo: { platform: string; firmware: { major: number; minor: number } } | null;
  accountToken?: string;
  watchToken?: string;
  userData?: Record<string, unknown>;
}

type M = ReturnType<typeof minified.HTML>;

function ClayConfig(this: any, settings: Record<string, unknown>, config: ClayConfigItem | ClayConfigItem[], $rootContainer: M, meta: ClayMeta) {
  const self: any = this;

  let _settings = _.copyObj(settings);
  let _items: any[] = [];
  let _itemsById: Record<string, any> = {};
  let _itemsByMessageKey: Record<string, any> = {};
  let _isBuilt: boolean = false;

  /**
   * Initialize the item arrays and objects
   */
  function _initializeItems(): void {
    _items = [];
    _itemsById = {};
    _itemsByMessageKey = {};
    _isBuilt = false;
  }

  /**
   * Add item(s) to the config
   */
  function _addItems(item: ClayConfigItem | ClayConfigItem[], $container: M): void {
    if (Array.isArray(item)) {
      item.forEach(function(item) {
        _addItems(item, $container);
      });
    } else if (utils.includesCapability(meta.activeWatchInfo as any, item.capabilities)) {
      if (item.type === 'section') {
        const $wrapper = HTML('<div class="section">');
        $container.add($wrapper);
        _addItems(item.items as ClayConfigItem[], $wrapper);
      } else {
        const _item = _.copyObj(item);
        _item.clayId = _items.length;

        const clayItem = new (ClayItem as any)(_item).initialize(self);

        if (_item.id) {
          _itemsById[_item.id] = clayItem;
        }

        if (_item.messageKey) {
          _itemsByMessageKey[_item.messageKey] = clayItem;
        }

        _items.push(clayItem);

        // set the value of the item via the manipulator to ensure consistency
        const msgKey = _item.messageKey as string;
        const value = typeof _settings[msgKey] !== 'undefined' ?
          _settings[msgKey] :
          _item.defaultValue;

        clayItem.set(typeof value !== 'undefined' ? value : '');

        $container.add(clayItem.$element);
      }
    }
  }

  /**
   * Throws if the config has not been built yet.
   */
  function _checkBuilt(fnName: string): boolean {
    if (!_isBuilt) {
      throw new Error(
        'ClayConfig not built. build() must be run before ' +
        'you can run ' + fnName + '()'
      );
    }
    return true;
  }

  self.meta = meta;
  self.$rootContainer = $rootContainer;

  self.EVENTS = {
    // Called before framework has initialised. This is when you would attach your
    // custom components.
    BEFORE_BUILD: 'BEFORE_BUILD',

    // Called after the config has been parsed and all components have their initial
    // value set
    AFTER_BUILD: 'AFTER_BUILD',

    // Called if .build() is executed after the page has already been built and
    // before the existing content is destroyed
    BEFORE_DESTROY: 'BEFORE_DESTROY',

    // Called if .build() is executed after the page has already been built and after
    // the existing content is destroyed
    AFTER_DESTROY: 'AFTER_DESTROY'
  } as const;
  utils.updateProperties(self.EVENTS, { writable: false });

  self.getAllItems = function() {
    _checkBuilt('getAllItems');
    return _items;
  };

  self.getItemByMessageKey = function(messageKey: string) {
    _checkBuilt('getItemByMessageKey');
    return _itemsByMessageKey[messageKey];
  };

  self.getItemById = function(id: string) {
    _checkBuilt('getItemById');
    return _itemsById[id];
  };

  self.getItemsByType = function(type: string) {
    _checkBuilt('getItemsByType');
    return _items.filter(function(item: any) {
      return item.config.type === type;
    });
  };

  self.getItemsByGroup = function(group: string) {
    _checkBuilt('getItemsByGroup');
    return _items.filter(function(item: any) {
      return item.config.group === group;
    });
  };

  self.serialize = function() {
    _checkBuilt('serialize');

    _settings = {};

    _.eachObj(_itemsByMessageKey, function(messageKey: string, item: any) {
      _settings[messageKey] = {
        value: item.get()
      };

      if (item.precision) {
        (_settings[messageKey] as Record<string, unknown>).precision = item.precision;
      }
    });
    return _settings;
  };

  // @todo maybe don't do this and force the static method
  self.registerComponent = ClayConfig.registerComponent;

  /**
   * Empties the root container
   */
  self.destroy = function() {
    const el = $rootContainer[0];
    self.trigger(self.EVENTS.BEFORE_DESTROY);
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    _initializeItems();
    self.trigger(self.EVENTS.AFTER_DESTROY);
    return self;
  };

  /**
   * Build the config page. This must be run before any of the get methods can be run
   * If you call this method after the page has already been built, the page will be
   * destroyed and built again.
   */
  self.build = function() {
    if (_isBuilt) {
      self.destroy();
    }
    self.trigger(self.EVENTS.BEFORE_BUILD);
    _addItems(self.config, $rootContainer);
    _isBuilt = true;
    self.trigger(self.EVENTS.AFTER_BUILD);
    return self;
  };

  _initializeItems();

  // attach event methods
  ClayEvents.call(self, $rootContainer);

  // prevent external modifications of properties
  utils.updateProperties(self, { writable: false, configurable: false });

  // expose the config to allow developers to update it before the build is run
  self.config = config;
}

interface RegisterComponentInput {
  name: string;
  template: string;
  manipulator: string | { get: Function; set: Function; [key: string]: unknown };
  defaults?: Record<string, unknown>;
  style?: string;
  initialize?: Function;
}

/**
 * Register a component to Clay. This must be called prior to .build();
 */
ClayConfig.registerComponent = function(component: RegisterComponentInput): boolean {
  const _component = _.copyObj(component) as any;

  if (componentStore[_component.name]) {
    console.warn('Component: ' + _component.name +
                 ' is already registered. If you wish to override the existing' +
                 ' functionality, you must provide a new name');
    return false;
  }

  if (typeof _component.manipulator === 'string') {
    _component.manipulator = manipulators[_component.manipulator];

    if (!_component.manipulator) {
      throw new Error('The manipulator: ' + component.manipulator +
                      ' does not exist in the built-in manipulators.');
    }
  }

  if (!_component.manipulator) {
    throw new Error('The manipulator must be defined');
  }

  if (typeof _component.manipulator.set !== 'function' ||
      typeof _component.manipulator.get !== 'function') {
    throw new Error('The manipulator must have both a `get` and `set` method');
  }

  if (_component.style) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(_component.style));
    document.head.appendChild(style);
  }

  componentStore[_component.name] = _component;
  return true;
};

export = ClayConfig;
