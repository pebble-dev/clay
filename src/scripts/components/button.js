'use strict';

module.exports = {
  name: 'button',
  template: require('../../templates/components/button.tpl'),
  style: require('../../../tmp/button.css'),
  manipulator: 'button',
  defaults: {
    primary: false,
    attributes: {},
    description: ''
  }
};
