'use strict';

import minified = require('../vendor/minified');
const _ = minified._;

interface M {
  [index: number]: HTMLElement;
  length: number;
  add(child: M | string): M;
  set(property: string, value?: unknown): M;
  set(cssObj: Record<string, unknown>): M;
  get(property: string): unknown;
  select(selector: string): M;
  on(events: string, handler: (...args: unknown[]) => void): M;
  off(handler: (...args: unknown[]) => void): M;
  trigger(name: string, eventObj?: unknown): M;
  each(callback: (element: HTMLElement, index: number) => void): M;
}

interface ManipulatorContext {
  $element: M;
  $manipulatorTarget: M;
  trigger(name: string, eventObj?: unknown): ManipulatorContext;
  get(): unknown;
  roundColorToLayout?(value: number): number;
}

// Shared manipulator methods
function disable(this: ManipulatorContext): ManipulatorContext {
  if (this.$manipulatorTarget.get('disabled')) { return this; }
  this.$element.set('+disabled');
  this.$manipulatorTarget.set('disabled', true);
  return this.trigger('disabled');
}

function enable(this: ManipulatorContext): ManipulatorContext {
  if (!this.$manipulatorTarget.get('disabled')) { return this; }
  this.$element.set('-disabled');
  this.$manipulatorTarget.set('disabled', false);
  return this.trigger('enabled');
}

function hide(this: ManipulatorContext): ManipulatorContext {
  if (this.$element[0].classList.contains('hide')) { return this; }
  this.$element.set('+hide');
  return this.trigger('hide');
}

function show(this: ManipulatorContext): ManipulatorContext {
  if (!this.$element[0].classList.contains('hide')) { return this; }
  this.$element.set('-hide');
  return this.trigger('show');
}

interface Manipulator {
  get(this: ManipulatorContext): unknown;
  set(this: ManipulatorContext, value: unknown): ManipulatorContext;
  disable?: (this: ManipulatorContext) => ManipulatorContext;
  enable?: (this: ManipulatorContext) => ManipulatorContext;
  hide?: (this: ManipulatorContext) => ManipulatorContext;
  show?: (this: ManipulatorContext) => ManipulatorContext;
}

export = {
  html: {
    get(this: ManipulatorContext) {
      return this.$manipulatorTarget.get('innerHTML');
    },
    set(this: ManipulatorContext, value: unknown) {
      if (this.get() === String(value)) { return this; }
      this.$manipulatorTarget.set('innerHTML', value);
      return this.trigger('change');
    },
    hide,
    show
  },
  button: {
    get(this: ManipulatorContext) {
      return this.$manipulatorTarget.get('innerHTML');
    },
    set(this: ManipulatorContext, value: unknown) {
      if (this.get() === String(value)) { return this; }
      this.$manipulatorTarget.set('innerHTML', value);
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  val: {
    get(this: ManipulatorContext) {
      return this.$manipulatorTarget.get('value');
    },
    set(this: ManipulatorContext, value: unknown) {
      if (this.get() === String(value)) { return this; }
      this.$manipulatorTarget.set('value', value);
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  slider: {
    get(this: ManipulatorContext) {
      return parseFloat(this.$manipulatorTarget.get('value') as string);
    },
    set(this: ManipulatorContext, value: unknown) {
      const initVal = this.get();
      this.$manipulatorTarget.set('value', value);
      if (this.get() === initVal) { return this; }
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  checked: {
    get(this: ManipulatorContext) {
      return this.$manipulatorTarget.get('checked');
    },
    set(this: ManipulatorContext, value: unknown) {
      if (!this.get() === !value) { return this; }
      this.$manipulatorTarget.set('checked', !!value);
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  radiogroup: {
    get(this: ManipulatorContext) {
      return this.$element.select('input:checked').get('value');
    },
    set(this: ManipulatorContext, value: unknown) {
      if (this.get() === String(value)) { return this; }
      this.$element
        .select('input[value="' + (value as string).replace('"', '\\"') + '"]')
        .set('checked', true);
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  checkboxgroup: {
    get(this: ManipulatorContext) {
      const result: boolean[] = [];
      this.$element.select('input').each(function(item: HTMLElement) {
        result.push(!!(item as HTMLInputElement).checked);
      });
      return result;
    },
    set(this: ManipulatorContext, values: unknown) {
      const self = this;
      let valuesArray = Array.isArray(values) ? values : [];

      while (valuesArray.length < (this.get() as boolean[]).length) {
        valuesArray.push(false);
      }

      if (_.equals(this.get(), valuesArray)) { return this; }

      self.$element.select('input')
        .set('checked', false)
        .each(function(item: HTMLElement, index: number) {
          (item as HTMLInputElement).checked = !!valuesArray[index];
        });

      return self.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  color: {
    get(this: ManipulatorContext) {
      return parseInt(this.$manipulatorTarget.get('value') as string, 10) || 0;
    },
    set(this: ManipulatorContext, value: unknown) {
      const roundedValue = this.roundColorToLayout ? this.roundColorToLayout(value as number || 0) : (value as number || 0);

      if (this.get() === roundedValue) { return this; }
      this.$manipulatorTarget.set('value', roundedValue);
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  }
} as Record<string, Manipulator>;
