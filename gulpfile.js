const { src, dest, series, watch } = require('gulp')
const babel = require('gulp-babel')
const connect = require('gulp-connect')
const del = require('del')
const imagemin = require('gulp-imagemin')
const inject = require('gulp-inject')
const minifyJS = require('gulp-uglify-es').default
const pug = require('gulp-pug')
const stylus = require('gulp-stylus')

let paths = {
  css: ['src/**/*.styl', '!src/**/[_]*.styl'],
  dist: "dist",
  html: {
    inject: ['dist/**/*.js', 'dist/**/*.css'],
    pug: ['src/**/*.pug', '!src/**/[_]*.pug']
  },
  js: 'src/**/*.js',
  watchFiles: ['src/**/*.styl', 'src/**/*.pug', 'src/**/*.js']
}

function clean() {
  return del(`${paths.dist}`, { force: true })
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

function css() {
  return src(paths.css)
    .pipe(stylus())
    .pipe(dest(paths.dist))
    .pipe(connect.reload())
}

function cssMinify() {
  return src(paths.css)
    .pipe(stylus({
      compress: true
    }))
    .pipe(dest(paths.dist))
}

function html() {
  return src(paths.html.pug)
    .pipe(pug({ pretty: true }))
    .pipe(inject(src(paths.html.inject, {
      read: false
    }), {
      relative: false,
      ignorePath: paths.dist
    }))
    .pipe(dest(paths.dist))
    .pipe(connect.reload())
}

function htmlMinify() {
  return src(paths.html.pug)
    .pipe(pug({ pretty: false }))
    .pipe(inject(src(paths.html.inject, {
      read: false
    }), {
      relative: false,
      ignorePath: paths.dist
    }))
    .pipe(dest(paths.dist))
}

function js() {
  return src(paths.js, { sourcemaps: false })
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(paths.dist, { sourcemaps: false }))
    .pipe(connect.reload())
}

function jsMinify() {
  return src(paths.js, { sourcemaps: false })
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(minifyJS())
    .pipe(dest(paths.dist, { sourcemaps: false }))
}

function imgMinify() {
  return src('src/assets/**/*')
    .pipe(imagemin())
    .pipe(dest(`${paths.dist}/assets`))
    .pipe(connect.reload())
}

function watchDev(done) {
  watch(paths.watchFiles, series(clean, css, js, imgMinify, html))
  done()
}

exports.clean = clean
exports.connect_dist = connect_dist
exports.css = css
exports.cssMinify = cssMinify
exports.html = html
exports.htmlMinify = htmlMinify
exports.imgMinify = imgMinify
exports.js = js
exports.jsMinify = jsMinify
exports.watchDev = watchDev

exports.prod = series(clean, cssMinify, jsMinify, imgMinify, htmlMinify)
exports.default = series(clean, css, js, imgMinify, html, connect_dist, watchDev)
