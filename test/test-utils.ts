'use strict';

import { assert } from 'chai';

function checkReadOnly(object: object, properties: string[]): void {
  properties.forEach(function(property) {
    const descriptor = Object.getOwnPropertyDescriptor(object, property);
    if (descriptor) {
      assert.strictEqual(descriptor.writable, false);
    }
  });
}

export = { checkReadOnly };
