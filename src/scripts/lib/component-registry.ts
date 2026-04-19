'use strict';

interface ClayComponentManipulator {
  get: (this: unknown) => unknown;
  set: (this: unknown, value: unknown) => unknown;
  disable?: (this: unknown) => unknown;
  enable?: (this: unknown) => unknown;
  hide?: (this: unknown) => unknown;
  show?: (this: unknown) => unknown;
}

interface ClayComponent {
  name: string;
  template: string;
  manipulator: ClayComponentManipulator;
  defaults?: Record<string, unknown>;
  style?: string;
  initialize?: (this: unknown, minified: unknown, clay: unknown) => void;
}

// Module is blank because we dynamically add components
const componentRegistry: Record<string, ClayComponent> = {};

export = componentRegistry;
