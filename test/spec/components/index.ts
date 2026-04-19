'use strict';

import { assert } from 'chai';
import Joi = require('joi');
import minified = require('../../../src/scripts/vendor/minified');
import components = require('../../../src/scripts/components');
import manipulators = require('../../../src/scripts/lib/manipulators');
import fixture = require('../../fixture');
import sinon = require('sinon');

const _ = minified._;
const HTML = minified.HTML;

const componentSchema = Joi.object().keys({
  name: Joi.string().required(),
  template: Joi.string().required(),
  style: Joi.string().optional(),
  manipulator: Joi.alternatives().try(
    Joi.string().valid(Object.keys(manipulators)),
    Joi.object().keys({
      get: Joi.func().required(),
      set: Joi.func().required()
    }).required().unknown(true)
  ),
  defaults: Joi.object().optional(),
  initialize: Joi.func().optional()
}).unknown(true);

describe('components', function(): void {
  _.eachObj(components, function(name: string, component: unknown): void {
    describe(name, function(): void {
      it('has the correct structure', function(): void {
        Joi.assert(component, componentSchema);
      });

      it('has all the necessary defaults', function(): void {
        assert.doesNotThrow(function(): void {
          if (typeof component !== 'object' || component === null) return;
          // as Record<string, unknown> is unavoidable after narrowing to object
          const comp = component as Record<string, unknown>;
          const template = comp.template;
          if (typeof template !== 'string') return;
          const defaults = comp.defaults as Record<string, unknown> | undefined;
          HTML(template.trim(), defaults);
        });
      });

      it('is able to be passed to ClayConfig', function(): void {
        if (typeof name !== 'string') return;
        fixture.clayConfig([name]);
      });

      it('only has one $manipulatorTarget', function(): void {
        if (typeof name !== 'string') return;
        const configItem = fixture.clayConfig([name]).getAllItems()[0];
        assert.strictEqual(configItem.$manipulatorTarget.length, 1);
      });

      it('only dispatches change events once', function(): void {
        if (typeof name !== 'string') return;
        const configItem = fixture.clayConfig([name]).getAllItems()[0];
        const handler = sinon.spy();
        configItem.on('change', handler);
        configItem.trigger('change');
        assert.strictEqual(handler.callCount, 1);
      });

    });
  });
});
