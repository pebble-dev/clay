
import { assert } from 'chai';

function checkReadOnly(object: object, properties: string[]): void {
  properties.forEach(function(property) {
    const descriptor = Object.getOwnPropertyDescriptor(object, property);
    assert.ok(descriptor, `Expected property "${property}" to be defined`);
    assert.strictEqual(descriptor!.writable, false);
  });
}

export default { checkReadOnly };
