'use strict';

import sinon = require('sinon');
import { assert } from 'chai';
import ClayEvents = require('../../../src/scripts/lib/clay-events');
import minified = require('../../../src/scripts/vendor/minified');
import type { ClayEventMethods } from '../../../src/scripts/lib/types';

const $ = minified.$;
const HTML = minified.HTML;

/**
 * @extends ClayEvents
 */
let ctx: ClayEventMethods;

let eventCounter = 0;

/**
 * Create a unique event name
 */
function createEventName(): string {
  eventCounter++;
  return 'test-event-' + eventCounter;
}

describe('ClayEvents', function(): void {

  beforeEach(function(): void {
    const contextObj = {} as unknown as ClayEventMethods;
    ClayEvents.call(contextObj, HTML('<div>'));
    ctx = contextObj;
  });

  it('registers the methods on the context', function(): void {
    ['on', 'off', 'trigger'].forEach(function(method: string): void {
      assert.typeOf(ctx[method as keyof ClayEventMethods], 'function');
    });
  });

  describe('.on()', function(): void {
    it('registers one event', function(): void {
      const eventName = createEventName();
      const eventHandlerSpy = sinon.spy();

      ctx.on(eventName, eventHandlerSpy);
      ctx.trigger(eventName);
      ctx.trigger(eventName);

      assert(eventHandlerSpy.calledTwice, 'handler not called 2 times');
      assert(eventHandlerSpy.alwaysCalledOn(ctx), 'handler not called on ctx');
    });

    it('registers multiple events', function(): void {
      const eventName1 = createEventName();
      const eventName2 = createEventName();
      const eventHandlerSpy = sinon.spy();

      ctx.on(eventName1 + ' ' + eventName2, eventHandlerSpy);
      ctx.trigger(eventName1);
      ctx.trigger(eventName1);
      ctx.trigger(eventName2);
      ctx.trigger(eventName2);

      assert.strictEqual(eventHandlerSpy.callCount, 4, 'handler not called 4 times');
      assert(eventHandlerSpy.alwaysCalledOn(ctx), 'handler not called on ctx');
    });
  });

  describe('.off()', function(): void {
    it('deregisters the handler for all events on the context', function(): void {
      const eventName1 = createEventName();
      const eventName2 = createEventName();
      const eventHandlerSpy = sinon.spy();

      const ctx1 = ctx;
      const contextObj2 = {} as unknown as ClayEventMethods;
      ClayEvents.call(contextObj2, HTML('<div>'));
      const ctx2 = contextObj2;

      (contextObj2 as unknown as Record<string, unknown>).id = 1;
      ctx1.on(eventName1, eventHandlerSpy);
      ctx1.on(eventName2, eventHandlerSpy);
      ctx2.on(eventName2, eventHandlerSpy);

      ctx1.trigger(eventName1);
      ctx1.trigger(eventName2);
      ctx2.trigger(eventName2);

      ctx1.off(eventHandlerSpy);

      ctx1.trigger(eventName1);
      ctx1.trigger(eventName2);
      ctx2.trigger(eventName2);

      assert.strictEqual(eventHandlerSpy.callCount, 4, 'handler not called 4 times');
    });

    it('does nothing if the handler does not exist', function(): void {
      // register a fake event so _getEventProxy() has something to look for
      ctx.on(createEventName(), sinon.spy());

      assert.doesNotThrow(function(): void {
        ctx.off(sinon.spy());
      });
    });
  });

  describe('.trigger()', function(): void {
    it('triggers the handler for the event with custom data', function(): void {
      const eventName = createEventName();
      const eventHandlerSpy = sinon.spy();
      const customData = {foo: 'bar'};

      ctx.on(eventName, eventHandlerSpy);
      ctx.trigger(eventName, customData);

      assert(eventHandlerSpy.calledOnce, 'handler not called 2 times');
      assert(eventHandlerSpy.alwaysCalledOn(ctx), 'handler not called on ctx');
      assert(eventHandlerSpy.calledWith(customData), 'handler not called on ctx');
    });
  });
});
