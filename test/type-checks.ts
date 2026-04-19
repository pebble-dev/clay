import Clay = require('../index');

// --- Exported types are accessible via the Clay namespace ---

const configItem: Clay.ClayConfigItem = {
  type: 'input',
  messageKey: 'name',
  defaultValue: '',
  label: 'Name',
  attributes: { placeholder: 'Enter name' },
  capabilities: ['COLOR'],
  group: 'appearance',
};

const meta: Clay.ClayMeta = {
  activeWatchInfo: {
    platform: 'basalt',
    model: 'qemu_platform_basalt',
    language: 'en_US',
    firmware: { major: 4, minor: 3, patch: 0, suffix: '' },
  },
  accountToken: 'abc',
  watchToken: 'def',
  userData: {},
};

const options: Clay.ClayOptions = {
  autoHandleEvents: true,
  userData: { foo: 'bar' },
};

const manipulator: Clay.ClayManipulator = {
  get() { return this.$manipulatorTarget.get('value'); },
  set(value) {
    this.$manipulatorTarget.set('value', value);
    return this;
  },
  disable() { return this; },
  enable() { return this; },
  hide() { return this; },
  show() { return this; },
};

const component: Clay.ClayComponent = {
  name: 'my-component',
  template: '<div></div>',
  manipulator,
  defaults: { label: 'Default' },
};

// --- Constructor ---

const clay = new Clay(
  [configItem, { type: 'heading', defaultValue: 'My App' }],
  function() {
    // `this` is ClayConfig — verify event methods
    const self: Clay.ClayConfig = this;

    const handler = (..._args: unknown[]) => {};
    this.on('AFTER_BUILD', handler);
    this.off(handler);
    this.trigger('AFTER_BUILD');

    // Verify chaining returns the same type
    this.on('BEFORE_BUILD', handler).off(handler);

    // Verify EVENTS constants
    const events: Clay.ClayConfigEvents = this.EVENTS;
    const beforeBuild: 'BEFORE_BUILD' = events.BEFORE_BUILD;
    const afterBuild: 'AFTER_BUILD' = events.AFTER_BUILD;
    const beforeDestroy: 'BEFORE_DESTROY' = events.BEFORE_DESTROY;
    const afterDestroy: 'AFTER_DESTROY' = events.AFTER_DESTROY;

    // Verify build/destroy return ClayConfig for chaining
    this.build().destroy().build();

    // Verify item getters
    const allItems: Clay.ClayItem[] = this.getAllItems();
    const byKey: Clay.ClayItem = this.getItemByMessageKey('bg_color');
    const byId: Clay.ClayItem = this.getItemById('my-id');
    const byType: Clay.ClayItem[] = this.getItemsByType('color');
    const byGroup: Clay.ClayItem[] = this.getItemsByGroup('appearance');

    // Verify ClayItem properties
    const item = byKey;
    const itemId: string | null = item.id;
    const itemMsgKey: string | null = item.messageKey;
    const itemConfig: Clay.ClayConfigItem = item.config;
    const $el: Clay.M = item.$element;
    const $target: Clay.M = item.$manipulatorTarget;

    // Verify ClayItem manipulator methods
    const value: unknown = item.get();
    const afterSet: Clay.ClayItem = item.set('new value');
    const afterDisable: Clay.ClayItem = item.disable();
    const afterEnable: Clay.ClayItem = item.enable();
    const afterHide: Clay.ClayItem = item.hide();
    const afterShow: Clay.ClayItem = item.show();

    // Verify ClayItem event methods
    item.on('change', handler).off(handler);
    item.trigger('change');

    // Verify ClayItem initialize
    const afterInit: Clay.ClayItem = item.initialize(this);

    // Verify serialize
    const serialised: Record<string, { value: unknown; precision?: number }> =
      this.serialize();

    // Verify meta
    const configMeta: Clay.ClayMeta = this.meta;

    // Verify registerComponent on instance
    const registered: boolean = this.registerComponent(component);
  },
  options
);

// Constructor with null customFn
const clay2 = new Clay([{ type: 'heading' }], null);

// Constructor with no options
const clay3 = new Clay([{ type: 'heading' }]);

// --- Instance properties ---

const config: Clay.ClayConfigItem[] = clay.config;
const version: string = clay.version;
const components: Record<string, Clay.ClayComponent> = clay.components;
const clayMeta: Clay.ClayMeta = clay.meta;
const customFn: (this: Clay.ClayConfig) => void = clay.customFn;

// --- Instance methods ---

clay.registerComponent(component);

// String manipulator name
clay.registerComponent({
  name: 'another',
  template: '<input>',
  manipulator: 'val',
});

const url: string = clay.generateUrl();
const settings: Record<string, unknown> = clay.getSettings('{}');
const rawSettings: Record<string, unknown> = clay.getSettings('{}', false);
clay.setSettings('key', 'value');
clay.setSettings({ key: 'value' });

// --- Static methods ---

const uri: string = Clay.encodeDataUri('<html></html>');
const uriWithPrefix: string = Clay.encodeDataUri('<html></html>', 'http://example.com/#');
const prepared: number | string | (number | string)[] = Clay.prepareForAppMessage(42);
const appMsg: Record<number, number | string> =
  Clay.prepareSettingsForAppMessage({ bg_color: { value: 255 } });

// --- M interface ---

function testM(el: Clay.M) {
  const len: number = el.length;
  const htmlEl: HTMLElement = el[0];
  const added: Clay.M = el.add('<span>');
  const afterSet: Clay.M = el.set('className', 'active');
  const val: unknown = el.get('value');
  const selected: Clay.M = el.select('.child');
  el.on('click', () => {});
  el.each((element: HTMLElement, index: number) => {});
}

// --- PebbleActiveWatchInfo ---

const watchInfo: Clay.PebbleActiveWatchInfo = {
  platform: 'chalk',
  model: 'qemu_platform_chalk',
  language: 'en_US',
  firmware: { major: 4, minor: 3, patch: 0, suffix: '' },
};
