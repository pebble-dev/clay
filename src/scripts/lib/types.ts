'use strict';

/**
 * Shared type definitions for the Clay framework.
 */

// M, MinifiedModule, MinifiedStatic, MinifiedUtils are declared
// globally in types/minified.d.ts

/** A Clay config item as provided in the config array */
export interface ClayConfigItem {
  type: string;
  defaultValue?: string | boolean | number;
  messageKey?: string;
  id?: string;
  label?: string;
  attributes?: Record<string, unknown>;
  options?: unknown[];
  items?: ClayConfigItem[];
  capabilities?: string[];
  group?: string;
  clayId?: number;
  [key: string]: unknown;
}

/** Watch info from the Pebble API */
export interface ActiveWatchInfo {
  platform: string;
  firmware: {
    major: number;
    minor: number;
  };
}

/** Clay meta information populated from the Pebble object */
export interface ClayMeta {
  activeWatchInfo: ActiveWatchInfo | null;
  accountToken?: string;
  watchToken?: string;
  userData?: Record<string, unknown>;
}

/** Event methods mixed in by ClayEvents */
export interface ClayEventMethods {
  on(events: string, handler: (...args: unknown[]) => void): this;
  off(handler: (...args: unknown[]) => void): this;
  trigger(name: string, eventObj?: unknown): this;
}

/** A manipulator method set bound to a ClayItem */
export interface BoundManipulator {
  get(): unknown;
  set(value: unknown): ClayItemInstance;
  disable?(): ClayItemInstance;
  enable?(): ClayItemInstance;
  hide?(): ClayItemInstance;
  show?(): ClayItemInstance;
}

/** A ClayItem instance with all dynamically-bound methods */
export interface ClayItemInstance extends ClayEventMethods, BoundManipulator {
  id: string | null;
  messageKey: string | null;
  config: ClayConfigItem;
  $element: M;
  $manipulatorTarget: M;
  precision?: number;
  initialize(clay: ClayConfigInstance): ClayItemInstance;
  [key: string]: unknown;
}

/** ClayConfig lifecycle event names */
export interface ClayConfigEvents {
  readonly BEFORE_BUILD: 'BEFORE_BUILD';
  readonly AFTER_BUILD: 'AFTER_BUILD';
  readonly BEFORE_DESTROY: 'BEFORE_DESTROY';
  readonly AFTER_DESTROY: 'AFTER_DESTROY';
}

/** A ClayConfig instance with all dynamically-bound methods */
export interface ClayConfigInstance extends ClayEventMethods {
  meta: ClayMeta;
  $rootContainer: M;
  EVENTS: ClayConfigEvents;
  config: ClayConfigItem | ClayConfigItem[];
  getAllItems(): ClayItemInstance[];
  getItemByMessageKey(messageKey: string): ClayItemInstance;
  getItemById(id: string): ClayItemInstance;
  getItemsByType(type: string): ClayItemInstance[];
  getItemsByGroup(group: string): ClayItemInstance[];
  serialize(): Record<string, unknown>;
  registerComponent(component: ClayComponentInput): boolean;
  destroy(): ClayConfigInstance;
  build(): ClayConfigInstance;
}

/** A manipulator definition (before binding to an item) */
export interface ManipulatorDef {
  get(this: ClayItemInstance): unknown;
  set(this: ClayItemInstance, value: unknown): ClayItemInstance;
  disable?(this: ClayItemInstance): ClayItemInstance;
  enable?(this: ClayItemInstance): ClayItemInstance;
  hide?(this: ClayItemInstance): ClayItemInstance;
  show?(this: ClayItemInstance): ClayItemInstance;
  [key: string]: ((this: ClayItemInstance, ...args: unknown[]) => unknown) | undefined;
}

/** A registered Clay component (after manipulator resolution) */
export interface ClayComponent {
  name: string;
  template: string;
  manipulator: ManipulatorDef;
  defaults?: Record<string, unknown>;
  style?: string;
  initialize?(this: ClayItemInstance, minified: unknown, clay: ClayConfigInstance): void;
}

/** Input to registerComponent (manipulator can be a string name) */
export interface ClayComponentInput {
  name: string;
  template: string;
  manipulator: string | ManipulatorDef;
  defaults?: Record<string, unknown>;
  style?: string;
  initialize?(this: ClayItemInstance, minified: unknown, clay: ClayConfigInstance): void;
}
