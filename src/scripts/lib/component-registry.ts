'use strict';

import { ClayComponent } from './types';

// Module is blank because we dynamically add components
const componentRegistry: Record<string, ClayComponent> = {};

export = componentRegistry;
