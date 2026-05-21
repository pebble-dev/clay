'use strict';

import minified = require('../vendor/minified');
import { ClayEventMethods } from '../lib/types';

const $ = minified.$;
const _ = minified._;

type MinifiedStatic = typeof minified.$;
type MinifiedUtils = typeof minified._;
type M = ReturnType<MinifiedStatic>;
type EventHandler = (...args: unknown[]) => void;

interface EventProxy {
  handler: EventHandler;
  proxy: EventHandler;
}

/**
 * Attaches event methods to the context.
 * Call with ClayEvents.call(yourObject, $eventTarget)
 */
function ClayEvents(this: ClayEventMethods, $eventTarget: M) {
  const self = this;
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
  function _registerEventProxy(handler: EventHandler, proxy: EventHandler): EventHandler {
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
  function _getEventProxy(handler: EventHandler): EventHandler | undefined {
    const eventProxy = _.find(_eventProxies, function(item) {
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
  self.on = function(events: string, handler: EventHandler) {
    const _events = _transformEventNames(events);
    const _proxy = _registerEventProxy(handler, function(this: unknown, ...args: unknown[]) {
      handler.apply(self, args);
    });
    $eventTarget.on(_events, _proxy);
    return self;
  };

  /**
   * Remove the given event handler. NOTE: This will remove the handler from all
   * registered events.
   * @param handler - the event handler function to remove
   * @returns the context object for chaining
   */
  self.off = function(handler: EventHandler) {
    const _proxy = _getEventProxy(handler);
    if (_proxy) {
      $.off(_proxy);
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
