'use strict';

import minified = require('./vendor/minified');
import ClayConfig = require('./lib/clay-config');
import { ClayComponentInput, ClayConfigItem, ClayMeta } from './lib/types';

const $ = minified.$;
const _ = minified._;

declare const window: Window & {
  clayConfig?: ClayConfigItem[];
  claySettings?: Record<string, unknown>;
  returnTo?: string;
  customFn?: Function;
  clayComponents?: Record<string, ClayComponentInput>;
  clayMeta?: ClayMeta;
};

const config = window.clayConfig || [];
const settings = window.claySettings || {};
const returnTo = window.returnTo || 'pebblejs://close#';
const customFn = window.customFn || function() {};
const clayComponents = window.clayComponents || {};
const clayMeta: ClayMeta = window.clayMeta || { activeWatchInfo: null };

const platform = window.navigator.userAgent.match(/android/i) ? 'android' : 'ios';
document.documentElement.classList.add('platform-' + platform);

// Register the passed components
_.eachObj(clayComponents, function(_key: string, component: ClayComponentInput) {
  ClayConfig.registerComponent(component);
});

const $mainForm = $('#main-form');
const clayConfig = ClayConfig(settings, config, $mainForm, clayMeta);

// Add listeners here
$mainForm.on('submit', function() {
  location.href = returnTo +
                  encodeURIComponent(JSON.stringify(clayConfig.serialize()));
});

// Run the custom function in the context of the ClayConfig
customFn.call(clayConfig, minified);

// Now that we have given the dev's custom code to run and attach listeners,
// we build the config
clayConfig.build();
