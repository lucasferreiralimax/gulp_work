import { src, dest, series, watch } from 'gulp'
import babel from 'gulp-babel'
import { server, reload } from 'gulp-connect'
import del from 'del'
import imagemin from 'gulp-imagemin'
import inject from 'gulp-inject'
import minifyJS from 'gulp-uglify-es'
import open from 'gulp-open'
import pug from 'gulp-pug'
import stylus from 'gulp-stylus'

const paths = {
  css: ['src/**/*.styl', '!src/**/[_]*.styl'],
  dist: "dist",
  html: {
    inject: ['dist/**/*.js', 'dist/**/*.css'],
    pug: ['src/**/*.pug', '!src/**/[_]*.pug']
  },
  js: 'src/**/*.js',
  watchFiles: ['src/**/*.styl', 'src/**/*.pug', 'src/**/*.js']
}

export const clean = () => del(`${paths.dist}`, { force: true });
export const openBrowser = () => src(__filename).pipe(open({uri: 'http://localhost:8080'}));

export const connect_dist = (done) => {
  server({
    name: 'Dist',
    root: 'dist',
    port: 8080,
    livereload: true
  })
  done()
}


export const css = () => {
  return src(paths.css)
    .pipe(stylus())
    .pipe(dest(paths.dist))
    .pipe(reload())
}

export const cssMinify = () => {
  return src(paths.css)
    .pipe(stylus({
      compress: true
    }))
    .pipe(dest(paths.dist))
}

export const html = () => {
  return src(paths.html.pug)
    .pipe(pug({ pretty: true }))
    .pipe(inject(src(paths.html.inject, {
      read: false
    }), {
      relative: false,
      ignorePath: paths.dist
    }))
    .pipe(dest(paths.dist))
    .pipe(reload())
}

export const htmlMinify = () => {
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

export const js = () => {
  return src(paths.js, { sourcemaps: false })
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(paths.dist, { sourcemaps: false }))
    .pipe(reload())
}

export const jsMinify = () => {
  return src(paths.js, { sourcemaps: false })
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(minifyJS())
    .pipe(dest(paths.dist, { sourcemaps: false }))
}

export const imgMinify = () => {
  return src('src/assets/**/*')
    .pipe(imagemin())
    .pipe(dest(`${paths.dist}/assets`))
    .pipe(reload())
}

export const watchDev = (done) => {
  watch(paths.watchFiles, series(clean, css, js, imgMinify, html))
  done()
}

export const prod = series(clean, cssMinify, jsMinify, imgMinify, htmlMinify)
export default series(clean, css, js, imgMinify, html, connect_dist, openBrowser, watchDev)