/**
 * TypeScript declarations for @rebble/clay
 *
 * A Pebble configuration framework that provides a simple way to generate a
 * configuration page for Pebble watchapps and watchfaces.
 */

/** Minimal DOM wrapper type from minified.js */
interface M {
  [index: number]: HTMLElement;
  length: number;
  add(child: M | string): M;
  set(property: string, value?: unknown): M;
  get(property: string): unknown;
  select(selector: string): M;
  on(events: string, handler: (...args: unknown[]) => void): M;
  each(callback: (element: HTMLElement, index: number) => void): M;
}

/** A Clay config item as provided in the config array */
interface ClayConfigItem {
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
}

/** A Clay component definition */
interface ClayComponent {
  name: string;
  template: string;
  manipulator: string | ClayManipulator;
  defaults?: Record<string, unknown>;
  style?: string;
  initialize?: (this: ClayItem, minified: unknown, clay: ClayConfig) => void;
}

/** A manipulator with get and set methods */
interface ClayManipulator {
  get: (this: ClayItem) => unknown;
  set: (this: ClayItem, value: unknown) => ClayItem;
  disable?: (this: ClayItem) => ClayItem;
  enable?: (this: ClayItem) => ClayItem;
  hide?: (this: ClayItem) => ClayItem;
  show?: (this: ClayItem) => ClayItem;
}

/** Clay meta information populated from the Pebble object */
interface ClayMeta {
  activeWatchInfo: PebbleActiveWatchInfo | null;
  accountToken: string;
  watchToken: string;
  userData: Record<string, unknown>;
}

/** Watch info from the Pebble API */
interface PebbleActiveWatchInfo {
  platform: string;
  model: string;
  language: string;
  firmware: {
    major: number;
    minor: number;
    patch: number;
    suffix: string;
  };
}

/** Options for the Clay constructor */
interface ClayOptions {
  autoHandleEvents?: boolean;
  userData?: Record<string, unknown>;
}

/** Event methods mixed in by ClayEvents */
interface ClayEvents {
  /**
   * Attach an event listener.
   * @param events - a space-separated list of events
   * @param handler - the event handler
   */
  on(events: string, handler: (...args: unknown[]) => void): this;

  /**
   * Remove the given event handler from all registered events.
   * @param handler - the handler to remove
   */
  off(handler: (...args: unknown[]) => void): this;

  /**
   * Trigger an event.
   * @param name - a single event name to trigger
   * @param eventObj - an object to pass to the event handler
   */
  trigger(name: string, eventObj?: unknown): this;
}

/** A ClayItem represents a single config component in the config page */
interface ClayItem extends ClayEvents {
  /** The item's id from the config, or null */
  id: string | null;

  /** The item's messageKey from the config, or null */
  messageKey: string | null;

  /** The raw config for this item */
  config: ClayConfigItem;

  /** The root DOM element wrapper */
  $element: M;

  /** The manipulator target DOM element wrapper */
  $manipulatorTarget: M;

  /** The precision for numeric values */
  precision?: number;

  /**
   * Run the component initialiser.
   * @param clay - the ClayConfig instance
   */
  initialize(clay: ClayConfig): ClayItem;

  /** Get the current value of the item via its manipulator */
  get(): unknown;

  /** Set the value of the item via its manipulator */
  set(value: unknown): ClayItem;

  /** Disable the item */
  disable(): ClayItem;

  /** Enable the item */
  enable(): ClayItem;

  /** Hide the item */
  hide(): ClayItem;

  /** Show the item */
  show(): ClayItem;
}

/** ClayConfig lifecycle event names */
interface ClayConfigEvents {
  readonly BEFORE_BUILD: 'BEFORE_BUILD';
  readonly AFTER_BUILD: 'AFTER_BUILD';
  readonly BEFORE_DESTROY: 'BEFORE_DESTROY';
  readonly AFTER_DESTROY: 'AFTER_DESTROY';
}

/** ClayConfig manages the config page and its items */
interface ClayConfig extends ClayEvents {
  /** Meta information from the Pebble object */
  meta: ClayMeta;

  /** The root container element */
  $rootContainer: M;

  /** Lifecycle event name constants */
  EVENTS: ClayConfigEvents;

  /** The config array (may be modified before build) */
  config: ClayConfigItem | ClayConfigItem[];

  /** Get all items. Must call build() first. */
  getAllItems(): ClayItem[];

  /** Get an item by its messageKey. Must call build() first. */
  getItemByMessageKey(messageKey: string): ClayItem;

  /** Get an item by its id. Must call build() first. */
  getItemById(id: string): ClayItem;

  /** Get all items of a given type. Must call build() first. */
  getItemsByType(type: string): ClayItem[];

  /** Get all items belonging to a given group. Must call build() first. */
  getItemsByGroup(group: string): ClayItem[];

  /** Serialise the current settings. Must call build() first. */
  serialize(): Record<string, { value: unknown; precision?: number }>;

  /** Register a component. Alias for ClayConfig.registerComponent. */
  registerComponent(component: ClayComponent): boolean;

  /** Destroy the config page and reset items. */
  destroy(): ClayConfig;

  /** Build the config page. Must be called before get methods. */
  build(): ClayConfig;
}

interface ClayConfigConstructor {
  new (
    settings: Record<string, unknown>,
    config: ClayConfigItem | ClayConfigItem[],
    $rootContainer: M,
    meta: ClayMeta
  ): ClayConfig;

  /**
   * Register a component to Clay. Must be called before build().
   */
  registerComponent(component: ClayComponent): boolean;
}

/**
 * The main Clay constructor.
 *
 * @param config - the Clay config array
 * @param customFn - custom code to run from the config page
 * @param options - additional options
 */
declare class Clay {
  constructor(
    config: ClayConfigItem[],
    customFn?: ((this: ClayConfig) => void) | null,
    options?: ClayOptions
  );

  /** The Clay config array */
  config: ClayConfigItem[];

  /** The custom function */
  customFn: (this: ClayConfig) => void;

  /** Registered components */
  components: Record<string, ClayComponent>;

  /** Meta information populated from the Pebble object */
  meta: ClayMeta;

  /** The Clay version string */
  version: string;

  /**
   * Register a component to Clay.
   * @param component - the clay component to register
   */
  registerComponent(component: ClayComponent): void;

  /**
   * Generate the Data URI used by the config page with settings injected.
   */
  generateUrl(): string;

  /**
   * Parse the response from the webviewclosed event data.
   * @param response - the response string
   * @param convert - if false, return raw settings without conversion
   */
  getSettings(response: string, convert?: boolean): Record<string, unknown>;

  /**
   * Update settings with the given key/value pair.
   * @param key - the setting key
   * @param value - the setting value
   */
  setSettings(key: string, value: unknown): void;

  /**
   * Update settings with the given object.
   * @param settings - an object of key/value pairs to set
   */
  setSettings(settings: Record<string, unknown>): void;

  /**
   * Encode content as a data URI.
   * @param input - the content to encode
   * @param prefix - the URI prefix
   */
  static encodeDataUri(input: string, prefix?: string): string;

  /**
   * Convert a value to a type compatible with Pebble.sendAppMessage().
   */
  static prepareForAppMessage(
    val: unknown
  ): number | string | (number | string)[];

  /**
   * Convert Clay settings to a format compatible with Pebble.sendAppMessage().
   */
  static prepareSettingsForAppMessage(
    settings: Record<string, unknown>
  ): Record<number, number | string>;
}

declare namespace Clay {
  export {
    ClayConfigItem,
    ClayComponent,
    ClayManipulator,
    ClayMeta,
    PebbleActiveWatchInfo,
    ClayOptions,
    ClayEvents,
    ClayItem,
    ClayConfig,
    ClayConfigEvents,
    ClayConfigConstructor,
    M,
  };
}

export = Clay;
