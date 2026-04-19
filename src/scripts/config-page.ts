'use strict';

import minified = require('./vendor/minified');
import ClayConfig = require('./lib/clay-config');

const $ = minified.$;
const _ = minified._;

declare const window: Window & {
  clayConfig?: unknown[];
  claySettings?: Record<string, unknown>;
  returnTo?: string;
  customFn?: Function;
  clayComponents?: Record<string, unknown>;
  clayMeta?: Record<string, unknown>;
};

const config: unknown = Object.assign([], window.clayConfig || []);
const settings: unknown = Object.assign({}, window.claySettings || {});
const returnTo = window.returnTo || 'pebblejs://close#';
const customFn = window.customFn || function() {};
const clayComponents = window.clayComponents || {};
const clayMeta = window.clayMeta || {};

const platform = window.navigator.userAgent.match(/android/i) ? 'android' : 'ios';
document.documentElement.classList.add('platform-' + platform);

// Register the passed components
_.eachObj(clayComponents, function(key: unknown, component: unknown) {
  ClayConfig.registerComponent(component as any);
});

const $mainForm = $('#main-form');

// ClayConfig is a constructor function — use Object.create + .call pattern
const clayConfig: any = Object.create(ClayConfig.prototype);
(ClayConfig as any).call(clayConfig, settings, config, $mainForm, clayMeta);

// add listeners here
$mainForm.on('submit', function() {
  // Set the return URL depending on the runtime environment
  location.href = returnTo +
                  encodeURIComponent(JSON.stringify(clayConfig.serialize()));
});

// Run the custom function in the context of the ClayConfig
customFn.call(clayConfig, minified);

// Now that we have given the dev's custom code to run and attach listeners,
// we build the config
clayConfig.build();
