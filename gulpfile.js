const { src, dest, series, watch, parallel } = require('gulp');
const minifyJS = require('gulp-uglify-es').default;
const stylus = require('gulp-stylus');
const pug = require('gulp-pug');
const babel = require('gulp-babel');
const inject = require('gulp-inject');
const connect = require('gulp-connect');
const del = require('del');

function clean_work() {
  return del('dist/**/*', {force:true})
}

function html() {
  return src('src/**/*.pug')
    .pipe(pug({ pretty: true }))
    .pipe(inject(src(['dist/**/*.js', 'dist/**/*.css'], {
      read: false
    }), {
      relative: false,
      ignorePath: '/dist'
    }))
    .pipe(dest('dist/'))
    .pipe(connect.reload())
}

function css() {
  return src(['src/**/*.styl', '!src/**/[_]*.styl'])
    .pipe(stylus())
    .pipe(dest('dist/'))
    .pipe(connect.reload())
}

function js() {
  return src('src/**/*.js', { sourcemaps: false })
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest('dist/', { sourcemaps: false }))
    .pipe(connect.reload())
}

function connect_dist(done) {
  connect.server({
    name: 'Dist',
    root: 'dist',
    port: 8000,
    livereload: true
  })
  done()
}

function watchDev(done) {
  watch(['src/**/*.styl', 'src/**/*.pug', 'src/**/*.js'], series(clean_work, css, js, html))
  done()
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.clean_work = clean_work;
exports.connect_dist = connect_dist;
exports.watchDev = watchDev;
exports.default = series(clean_work, css, js, html, connect_dist, watchDev);
