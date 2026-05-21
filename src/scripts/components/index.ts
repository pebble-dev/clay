'use strict';

import { ClayComponentInput } from '../lib/types';

import color = require('./color');
import footer = require('./footer');
import heading = require('./heading');
import input = require('./input');
import select = require('./select');
import submit = require('./submit');
import text = require('./text');
import toggle = require('./toggle');
import radiogroup = require('./radiogroup');
import checkboxgroup = require('./checkboxgroup');
import button = require('./button');
import slider = require('./slider');

const components: Record<string, ClayComponentInput> = {
  color,
  footer,
  heading,
  input,
  select,
  submit,
  text,
  toggle,
  radiogroup,
  checkboxgroup,
  button,
  slider
};

export = components;
