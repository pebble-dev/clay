'use strict';

import { ClayItemInstance } from '../lib/types';

export = {
  name: 'slider',
  template: require('../../templates/components/slider.tpl'),
  style: require('../../../tmp/slider.css'),
  manipulator: 'slider',
  defaults: {
    label: '',
    description: '',
    min: 0,
    max: 100,
    step: 1,
    attributes: {}
  },
  initialize: function(this: ClayItemInstance) {
    const self = this;

    const $value = self.$element.select('.value');
    const $valuePad = self.$element.select('.value-pad');
    const $slider = self.$manipulatorTarget;

    // Sets the value display
    function setValueDisplay() {
      var rawValue = self.get();
      var value = typeof rawValue === 'number' ? rawValue.toFixed(self.precision) : String(rawValue);
      $value.set('value', value);
      $valuePad.set('innerHTML', value);
    }

    var stepStr = String($slider.get('step'));
    var stepDecimal = stepStr.split('.')[1];
    self.precision = stepDecimal ? stepDecimal.length : 0;

    self.on('change', setValueDisplay);
    $slider.on('|input', setValueDisplay);
    setValueDisplay();

    $value.on('|input', function() {
      $valuePad.set('innerHTML', $value.get('value'));
    });

    $value.on('|change', function() {
      self.set($value.get('value'));
      setValueDisplay();
    });
  }
};
