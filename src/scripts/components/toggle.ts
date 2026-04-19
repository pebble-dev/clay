'use strict';

export = {
  name: 'toggle',
  template: require('../../templates/components/toggle.tpl'),
  style: require('../../../tmp/toggle.css'),
  manipulator: 'checked',
  defaults: {
    label: '',
    description: '',
    attributes: {}
  }
};
