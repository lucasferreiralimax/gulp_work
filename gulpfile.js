const { src, dest, series } = require('gulp');
const minifyJS = require('gulp-uglify-es').default;
const clean = require('gulp-clean');
const stylus = require('gulp-stylus');
const pug = require('gulp-pug');
const babel = require('gulp-babel');
const inject = require('gulp-inject');

function clean_work() {
  return src('dist', { read: false, allowEmpty: true })
    .pipe(clean({force: true}))
}

function html() {
  return src('src/**/*.pug')
    .pipe(pug({ pretty: true }))
    .pipe(inject(src(['./dist/**/*.js', './dist/**/*.css'], {read: false}), {relative: true}))
    .pipe(dest('dist/'))
}

function css() {
  return src(['src/**/*.styl', '!src/**/[_]*.styl'])
    .pipe(stylus())
    .pipe(dest('dist/'))
}

function js() {
  return src('src/**/*.js', { sourcemaps: false })
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest('dist/', { sourcemaps: false }))
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.clean_work = clean_work;
exports.default = series(clean_work, css, js, html);
