'use strict';

module.exports = {
  name: 'checkboxgroup',
  template: require('../../templates/components/checkboxgroup.tpl'),
  style: require('../../../tmp/checkboxgroup.css'),
  manipulator: 'checkboxgroup',
  defaults: {
    label: '',
    options: [],
    description: ''
  }
};
