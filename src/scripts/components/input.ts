'use strict';

export = {
  name: 'input',
  template: require('../../templates/components/input.tpl'),
  style: require('../../../tmp/input.css'),
  manipulator: 'val',
  defaults: {
    label: '',
    description: '',
    attributes: {}
  }
};
