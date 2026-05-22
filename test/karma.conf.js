'use strict';

// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'source-map-support', 'mocha'],

    client: {
      mocha: {
        timeout: 10000 // 10 sec because Travis struggles sometimes.
      }
    },

    browserify: {
      debug: true,
      extensions: ['.ts'],
      plugin: [
        ['tsify', { noEmit: false, forceConsistentCasingInFileNames: false }]
      ],
      transform: [
        [
          'stringify',
          {
            extensions: ['.html', '.tpl', '.css']
          }
        ],
        'deamdify',
        [
          'browserify-istanbul',
          {
            ignore: process.env.DEBUG ? ['**/**'] :
              [
                '**/test/**',
                '**/src/scripts/vendor/**',
                '**/src/scripts/config-page.ts'
              ]
          }
        ]
      ],
      configure: function(bundle) {
        bundle.on('prebundle', function() {
          bundle.ignore('message_keys');
        });
      }
    },

    mime: {
      'application/javascript': ['ts']
    },

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'index.ts', type: 'js' },
      { pattern: 'src/scripts/**/*.ts', type: 'js' },
      { pattern: 'test/spec/**/*.ts', type: 'js' }
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'index.ts': ['browserify'],
      'src/scripts/**/*.ts': ['browserify'],
      'test/spec/**/*.ts': ['browserify']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: process.env.DEBUG ?
      ['mocha'] :
      ['mocha', 'coverage', 'threshold'],

    // optionally, configure the reporter
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        {type: 'text-summary'},
        {type: 'html', subdir: '.'}
      ]
    },

    thresholdReporter: {
      // TypeScript→Istanbul source-map artifacts reduce measured
      // coverage below 100%. Istanbul instruments compiled ES5,
      // then remaps to TS source via source maps, creating phantom
      // branches on: ternary expressions, logical operators (&&/||),
      // shorthand property references, and static data literals
      // containing false. These thresholds catch real regressions
      // while tolerating artifacts.
      statements: 98,
      branches: 90,
      functions: 98,
      lines: 98
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN ||
    // config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // set via the command line
    customLaunchers: {
      chromeTravisCI: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};

