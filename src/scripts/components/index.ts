
import { ClayComponentInput } from '../lib/types';

import color from './color';
import footer from './footer';
import heading from './heading';
import input from './input';
import select from './select';
import submit from './submit';
import text from './text';
import toggle from './toggle';
import radiogroup from './radiogroup';
import checkboxgroup from './checkboxgroup';
import button from './button';
import slider from './slider';

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

export default components;
