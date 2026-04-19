'use strict';

const components: Record<string, unknown> = {
  color: require('./color'),
  footer: require('./footer'),
  heading: require('./heading'),
  input: require('./input'),
  select: require('./select'),
  submit: require('./submit'),
  text: require('./text'),
  toggle: require('./toggle'),
  radiogroup: require('./radiogroup'),
  checkboxgroup: require('./checkboxgroup'),
  button: require('./button'),
  slider: require('./slider')
};

export = components;
