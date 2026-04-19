'use strict';

import minified = require('../vendor/minified');
const HTML = minified.HTML;
const _ = minified._;

import ClayItem = require('./clay-item');
import utils = require('../lib/utils');
import ClayEvents = require('./clay-events');
import componentStore = require('./component-registry');
import manipulators = require('./manipulators');
import { ClayConfigItem, ClayMeta, ClayConfigInstance, ClayItemInstance, ClayComponentInput, ClayComponent, ManipulatorDef } from './types';

type M = ReturnType<typeof minified.HTML>;

function ClayConfig(this: ClayConfigInstance, settings: Record<string, unknown>, config: ClayConfigItem | ClayConfigItem[], $rootContainer: M, meta: ClayMeta) {
  const self = this;

  let _settings = _.copyObj(settings);
  let _items: ClayItemInstance[] = [];
  let _itemsById: Record<string, ClayItemInstance> = {};
  let _itemsByMessageKey: Record<string, ClayItemInstance> = {};
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
    } else if (meta.activeWatchInfo && utils.includesCapability(meta.activeWatchInfo, item.capabilities)) {
      if (item.type === 'section') {
        const $wrapper = HTML('<div class="section">');
        $container.add($wrapper);
        if (item.items) {
          _addItems(item.items, $wrapper);
        }
      } else {
        const _item = _.copyObj(item);
        _item.clayId = _items.length;

        const clayItem = ClayItem(_item).initialize(self);

        if (_item.id) {
          _itemsById[_item.id] = clayItem;
        }

        if (_item.messageKey) {
          _itemsByMessageKey[_item.messageKey] = clayItem;
        }

        _items.push(clayItem);

        // set the value of the item via the manipulator to ensure consistency
        if (_item.messageKey) {
          const msgKey = _item.messageKey;
          const value = typeof _settings[msgKey] !== 'undefined' ?
            _settings[msgKey] :
            _item.defaultValue;

          clayItem.set(typeof value !== 'undefined' ? value : '');
        }

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
    return _items.filter(function(item: ClayItemInstance) {
      return item.config.type === type;
    });
  };

  self.getItemsByGroup = function(group: string) {
    _checkBuilt('getItemsByGroup');
    return _items.filter(function(item: ClayItemInstance) {
      return item.config.group === group;
    });
  };

  self.serialize = function() {
    _checkBuilt('serialize');

    _settings = {};

    _.eachObj(_itemsByMessageKey, function(messageKey: string, item: ClayItemInstance) {
      const settingValue: Record<string, unknown> = {
        value: item.get()
      };

      if (item.precision) {
        settingValue.precision = item.precision;
      }

      _settings[messageKey] = settingValue;
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

/**
 * Register a component to Clay. This must be called prior to .build();
 */
ClayConfig.registerComponent = function(component: ClayComponentInput): boolean {
  const _component = _.copyObj(component);

  if (componentStore[_component.name]) {
    console.warn('Component: ' + _component.name +
                 ' is already registered. If you wish to override the existing' +
                 ' functionality, you must provide a new name');
    return false;
  }

  let resolvedManipulator: ManipulatorDef;

  if (typeof _component.manipulator === 'string') {
    const found = manipulators[_component.manipulator];

    if (!found) {
      throw new Error('The manipulator: ' + _component.manipulator +
                      ' does not exist in the built-in manipulators.');
    }
    resolvedManipulator = found;
  } else if (_component.manipulator) {
    resolvedManipulator = _component.manipulator;
  } else {
    throw new Error('The manipulator must be defined');
  }

  if (typeof resolvedManipulator.set !== 'function' ||
      typeof resolvedManipulator.get !== 'function') {
    throw new Error('The manipulator must have both a `get` and `set` method');
  }

  if (_component.style) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(_component.style));
    document.head.appendChild(style);
  }

  const registered: ClayComponent = {
    name: _component.name,
    template: _component.template,
    manipulator: resolvedManipulator,
    defaults: _component.defaults,
    style: _component.style,
    initialize: _component.initialize
  };

  componentStore[registered.name] = registered;
  return true;
};

function createClayConfig(
  settings: Record<string, unknown>,
  config: ClayConfigItem | ClayConfigItem[],
  $rootContainer: M,
  meta: ClayMeta
): ClayConfigInstance {
  const instance: ClayConfigInstance = Object.create(ClayConfig.prototype);
  ClayConfig.call(instance, settings, config, $rootContainer, meta);
  return instance;
}

createClayConfig.registerComponent = ClayConfig.registerComponent;

export = createClayConfig;
