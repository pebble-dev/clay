'use strict';

import minified = require('../vendor/minified');
const $ = minified.$;
const _ = minified._;

type MinifiedStatic = typeof minified.$;
type MinifiedUtils = typeof minified._;
type M = ReturnType<MinifiedStatic>;

interface EventProxy {
  handler: Function;
  proxy: Function;
}

/**
 * Attaches event methods to the context.
 * Call with ClayEvents.call(yourObject, $eventTarget)
 */
function ClayEvents(this: unknown, $eventTarget: M) {
  const self = this as any;
  const _eventProxies: Array<EventProxy> = [];

  /**
   * Prefixes events with "|"
   */
  function _transformEventNames(events: string): string {
    return events.split(' ').map(function(event) {
      return '|' + event.replace(/^\|/, '');
    }).join(' ');
  }

  /**
   * Register or retrieve a proxy for the given handler.
   */
  function _registerEventProxy(handler: Function, proxy: Function): Function {
    const eventProxy = _.find(_eventProxies, function(item) {
      return item.handler === handler ? item : null;
    });

    if (!eventProxy) {
      const newProxy: EventProxy = { handler: handler, proxy: proxy };
      _eventProxies.push(newProxy);
      return proxy;
    }
    return eventProxy.proxy;
  }

  /**
   * Retrieve the proxy function for the given handler.
   */
  function _getEventProxy(handler: Function): Function | undefined {
    var eventProxy = _.find(_eventProxies, function(item) {
      return item.handler === handler ? item : null;
    });
    return eventProxy ? eventProxy.proxy : undefined;
  }

  /**
   * Attach an event listener to the item.
   * @param events - a space separated list of events
   * @param handler - the event handler function
   * @returns the context object for chaining
   */
  self.on = function(events: string, handler: Function) {
    const _events = _transformEventNames(events);
    const _proxy = _registerEventProxy(handler, function(this: unknown) {
      handler.apply(self, arguments);
    });
    $eventTarget.on(_events, _proxy as (...args: unknown[]) => void);
    return self;
  };

  /**
   * Remove the given event handler. NOTE: This will remove the handler from all
   * registered events.
   * @param handler - the event handler function to remove
   * @returns the context object for chaining
   */
  self.off = function(handler: Function) {
    const _proxy = _getEventProxy(handler);
    if (_proxy) {
      $.off(_proxy as (...args: unknown[]) => void);
    }
    return self;
  };

  /**
   * Trigger an event.
   * @param name - a single event name to trigger
   * @param eventObj - an optional object to pass to the event handler
   * @returns the context object for chaining
   */
  self.trigger = function(name: string, eventObj?: unknown) {
    $eventTarget.trigger(name, eventObj);
    return self;
  };
}

export = ClayEvents;
