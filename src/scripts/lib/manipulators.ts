'use strict';

import minified = require('../vendor/minified');
import { ManipulatorDef, ClayItemInstance } from '../lib/types';

const _ = minified._;

function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return 'checked' in el;
}

// Shared manipulator methods
function disable(this: ClayItemInstance): ClayItemInstance {
  if (this.$manipulatorTarget.get('disabled')) { return this; }
  this.$element.set('+disabled');
  this.$manipulatorTarget.set('disabled', true);
  return this.trigger('disabled');
}

function enable(this: ClayItemInstance): ClayItemInstance {
  if (!this.$manipulatorTarget.get('disabled')) { return this; }
  this.$element.set('-disabled');
  this.$manipulatorTarget.set('disabled', false);
  return this.trigger('enabled');
}

function hide(this: ClayItemInstance): ClayItemInstance {
  if (this.$element[0].classList.contains('hide')) { return this; }
  this.$element.set('+hide');
  return this.trigger('hide');
}

function show(this: ClayItemInstance): ClayItemInstance {
  if (!this.$element[0].classList.contains('hide')) { return this; }
  this.$element.set('-hide');
  return this.trigger('show');
}

const manipulators: Record<string, ManipulatorDef> = {
  html: {
    get(this: ClayItemInstance) {
      return this.$manipulatorTarget.get('innerHTML');
    },
    set(this: ClayItemInstance, value: unknown) {
      if (this.get() === String(value)) { return this; }
      this.$manipulatorTarget.set('innerHTML', value);
      return this.trigger('change');
    },
    hide,
    show
  },
  button: {
    get(this: ClayItemInstance) {
      return this.$manipulatorTarget.get('innerHTML');
    },
    set(this: ClayItemInstance, value: unknown) {
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
    get(this: ClayItemInstance) {
      return this.$manipulatorTarget.get('value');
    },
    set(this: ClayItemInstance, value: unknown) {
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
    get(this: ClayItemInstance) {
      return parseFloat(String(this.$manipulatorTarget.get('value')));
    },
    set(this: ClayItemInstance, value: unknown) {
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
    get(this: ClayItemInstance) {
      return this.$manipulatorTarget.get('checked');
    },
    set(this: ClayItemInstance, value: unknown) {
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
    get(this: ClayItemInstance) {
      return this.$element.select('input:checked').get('value');
    },
    set(this: ClayItemInstance, value: unknown) {
      if (this.get() === String(value)) { return this; }
      this.$element
        .select('input[value="' + String(value).replace('"', '\\"') + '"]')
        .set('checked', true);
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  checkboxgroup: {
    get(this: ClayItemInstance) {
      const result: boolean[] = [];
      this.$element.select('input').each(function(item: HTMLElement) {
        if (isInputElement(item)) {
          result.push(!!item.checked);
        }
      });
      return result;
    },
    set(this: ClayItemInstance, values: unknown) {
      const self = this;
      let valuesArray = Array.isArray(values) ? values : [];

      const current = this.get();
      const currentArr = Array.isArray(current) ? current : [];
      while (valuesArray.length < currentArr.length) {
        valuesArray.push(false);
      }

      if (_.equals(this.get(), valuesArray)) { return this; }

      self.$element.select('input')
        .set('checked', false)
        .each(function(item: HTMLElement, index: number) {
          if (isInputElement(item)) {
            item.checked = !!valuesArray[index];
          }
        });

      return self.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  },
  color: {
    get(this: ClayItemInstance) {
      return parseInt(String(this.$manipulatorTarget.get('value')), 10) || 0;
    },
    set(this: ClayItemInstance, value: unknown) {
      const numValue = Number(value) || 0;
      const roundColorFunc = this['roundColorToLayout'];
      const roundedValue = typeof roundColorFunc === 'function' ? roundColorFunc.call(this, numValue) : numValue;

      if (this.get() === roundedValue) { return this; }
      this.$manipulatorTarget.set('value', roundedValue);
      return this.trigger('change');
    },
    disable,
    enable,
    hide,
    show
  }
};

export = manipulators;
