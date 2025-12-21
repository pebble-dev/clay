'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var stringify = require('stringify');
var del = require('del');
var inline = require('gulp-inline');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass')(require('sass'));
var sourceMaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var autoprefixify = require('./src/scripts/vendor/autoprefixify');
var insert = require('gulp-insert');
var clayPackage = require('./package.json');

var sassIncludePaths = [].concat(
  require('bourbon').includePaths,
  'src/styles'
);

var autoprefixerOptions = {
  browsers: ['Android 4', 'iOS 8'],
  cascade: false
};

var stringifyOptions = ['.html', '.tpl', '.css'];
var versionMessage = '/* Clay - https://github.com/pebble-dev/clay - Version: ' +
                     clayPackage.version +
                     ' - Build Date: ' + new Date().toISOString() + ' */\n';

gulp.task('clean-js', function() {
  return del(['tmp/config-page.js']);
});

/**
* @returns {string}
*/
function taskJs() {
  return browserify('src/scripts/config-page.js', { debug: true })
    .transform('deamdify')
    .bundle()
    .pipe(source('config-page.js'))
    .pipe(gulp.dest('./tmp/'));
}

gulp.task('js', gulp.series('clean-js', taskJs));

gulp.task('clean-sass', function() {
  return del(['tmp/config-page.scss']);
});

/**
* @returns {string}
*/
function taskSass() {
  return gulp.src(['./src/styles/config-page.scss',
                   './src/styles/clay/components/*.scss'])
    .pipe(sourceMaps.init())
    .pipe(sass({
      loadPaths: sassIncludePaths
    }).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest('tmp'));
}

gulp.task('sass', gulp.series('clean-sass', taskSass));

/**
* @returns {string}
*/
function taskInlineHtml() {
  return gulp.src('src/config-page.html')
    .pipe(inline())
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      removeRedundantAttributes: true,
      caseSensitive: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest('tmp/'));
}

gulp.task('inlineHtml', gulp.series('js', 'sass', taskInlineHtml));

/**
* @returns {string}
*/
function taskClay() {
  return browserify('index.js', {
    debug: false,
    standalone: clayPackage.name
  })
    .transform('deamdify')
    .transform(stringify(stringifyOptions))
    // .transform(autoprefixify, autoprefixerOptions)
    .require(require.resolve('./index'), {expose: clayPackage.name})
    .exclude('message_keys')
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify({
      preserveComments: 'license'
    }))
    .pipe(insert.prepend(versionMessage))
    .pipe(gulp.dest('./src/js'));
}

gulp.task('clay', gulp.series('inlineHtml', taskClay));

/**
* @returns {string}
*/
function taskDevJs() {
  return browserify('dev/dev.js', { debug: true })
    .transform(stringify(stringifyOptions))
    .transform('deamdify')
    .transform(autoprefixify, autoprefixerOptions)
    .ignore('message_keys')
    .bundle()
    .pipe(source('dev.js'))
    .pipe(gulp.dest('./tmp/'));
}

gulp.task('dev-js', gulp.series('js', 'sass', taskDevJs));

gulp.task('default', gulp.series('clay'));

/**
* @returns {string}
*/
function taskDev() {
  gulp.watch('src/styles/**/*.scss', ['sass']);
  gulp.watch(['src/scripts/**/*.js', 'src/templates/**/*.tpl'], ['js']);
  gulp.watch(['src/**', 'dev/**/*.js'], ['dev-js']);
}

gulp.task('dev', gulp.series('dev-js', taskDev));
