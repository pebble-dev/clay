'use strict';

import componentRegistry = require('./component-registry');
import minified = require('../vendor/minified');
import utils = require('../lib/utils');
import ClayEvents = require('./clay-events');

const _ = minified._;
const HTML = minified.HTML;

interface ClayConfigItem {
  type: string;
  id?: string;
  messageKey?: string;
  [key: string]: unknown;
}

/**
 * Represents a configurable item in Clay. Initialises with the component
 * type, attaches event methods via ClayEvents mixin, and binds manipulator methods.
 * Extends ClayEvents for on/off/trigger event handling.
 */
function ClayItem(this: any, config: ClayConfigItem) {
  const self = this;

  const _component = componentRegistry[config.type];

  if (!_component) {
    throw new Error('The component: ' + config.type + ' is not registered. ' +
                    'Make sure to register it with ClayConfig.registerComponent()');
  }

  const _templateData = _.extend({}, _component.defaults || {}, config);

  self.id = config.id || null;

  self.messageKey = config.messageKey || null;

  self.config = config;

  self.$element = HTML(_component.template.trim(), _templateData);

  self.$manipulatorTarget = self.$element.select('[data-manipulator-target]');

  // this caters for situations where the manipulator target is the root element
  if (!self.$manipulatorTarget.length) {
    self.$manipulatorTarget = self.$element;
  }

  /**
   * Run the initialiser if it exists and attaches the css to the head.
   * Passes minified as the first param.
   */
  self.initialize = function(clay: unknown) {
    if (typeof _component.initialize === 'function') {
      _component.initialize.call(self, minified, clay);
    }
    return self;
  };

  // attach event methods
  ClayEvents.call(self, self.$manipulatorTarget);

  // attach the manipulator methods to the clayItem
  _.eachObj(_component.manipulator, function(methodName: string, method: Function) {
    self[methodName] = method.bind(self);
  });

  // prevent external modifications of properties
  utils.updateProperties(self, { writable: false, configurable: false });
}

export = ClayItem;
