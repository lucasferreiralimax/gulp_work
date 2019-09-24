const { src, dest, series, watch } = require('gulp')
const babel = require('gulp-babel')
const connect = require('gulp-connect')
const del = require('del')
const imagemin = require('gulp-imagemin')
const inject = require('gulp-inject')
const minifyJS = require('gulp-uglify-es').default
const pug = require('gulp-pug')
const stylus = require('gulp-stylus')

function clean_work() {
  return del('dist/**/*', { force: true })
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
  return src(['src/**/*.styl', '!src/**/[_]*.styl'])
    .pipe(stylus())
    .pipe(dest('dist/'))
    .pipe(connect.reload())
}

function cssMinify() {
  return src(['src/**/*.styl', '!src/**/[_]*.styl'])
    .pipe(stylus({
      compress: true
    }))
    .pipe(dest('dist/'))
    .pipe(connect.reload())
}

function html() {
  return src(['src/**/*.pug', '!src/**/[_]*.pug'])
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

function htmlMinify() {
  return src(['src/**/*.pug', '!src/**/[_]*.pug'])
    .pipe(pug({ pretty: false }))
    .pipe(inject(src(['dist/**/*.js', 'dist/**/*.css'], {
      read: false
    }), {
      relative: false,
      ignorePath: '/dist'
    }))
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

function jsMinify() {
  return src('src/**/*.js', { sourcemaps: false })
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(minifyJS())
    .pipe(dest('dist/', { sourcemaps: false }))
    .pipe(connect.reload())
}

function imgMinify() {
  return src('src/assets/**/*')
    .pipe(imagemin())
    .pipe(dest('dist/assets'))
    .pipe(connect.reload())
}

function watchDev(done) {
  watch(['src/**/*.styl', 'src/**/*.pug', 'src/**/*.js'], series(clean_work, css, js, imgMinify, html))
  done()
}

function watchDevMinify(done) {
  watch(['src/**/*.styl', 'src/**/*.pug', 'src/**/*.js'], series(clean_work, cssMinify, jsMinify, imgMinify, htmlMinify))
  done()
}

exports.clean_work = clean_work
exports.connect_dist = connect_dist
exports.css = css
exports.cssMinify = cssMinify
exports.html = html
exports.htmlMinify = htmlMinify
exports.imgMinify = imgMinify
exports.js = js
exports.jsMinify = jsMinify
exports.watchDev = watchDev
exports.watchDevMinify = watchDevMinify

exports.minify = series(clean_work, cssMinify, imgMinify, jsMinify, htmlMinify, connect_dist, watchDevMinify)
exports.default = series(clean_work, css, imgMinify, js, html, connect_dist, watchDev)
