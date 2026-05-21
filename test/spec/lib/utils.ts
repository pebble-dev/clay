'use strict';

import utils = require('../../../src/scripts/lib/utils');
import { assert } from 'chai';

describe('Utils', function(): void {
  describe('.updateProperties', function(): void {
    let obj: Record<string, unknown>;

    beforeEach(function(): void {
      obj = {
        one: 1,
        two: 2
      };
    });

    it('sets the properties as non-writable', function(): void {
      utils.updateProperties(obj, { writable: false });
      const descriptor1 = Object.getOwnPropertyDescriptor(obj, 'one');
      assert.strictEqual(
        descriptor1?.writable,
        false
      );
      const descriptor2 = Object.getOwnPropertyDescriptor(obj, 'two');
      assert.strictEqual(
        descriptor2?.writable,
        false
      );
    });
  });
});
