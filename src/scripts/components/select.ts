'use strict';

import { ClayItemInstance } from '../lib/types';

export = {
  name: 'select',
  template: require('../../templates/components/select.tpl'),
  style: require('../../../tmp/select.css'),
  manipulator: 'val',
  defaults: {
    label: '',
    options: [],
    description: '',
    attributes: {}
  },
  initialize: function(this: ClayItemInstance) {
    const self = this;

    const $value = self.$element.select('.value');

    // Updates the HTML value of the component to match the selected option's label
    function setValueDisplay() {
      var idx = Number(self.$manipulatorTarget.get('selectedIndex'));
      var $options = self.$manipulatorTarget.select('option');
      var optionEl = $options[idx];
      var value = optionEl ? optionEl.innerHTML : '';
      $value.set('innerHTML', value);
    }

    setValueDisplay();
    self.on('change', setValueDisplay);
  }
};
