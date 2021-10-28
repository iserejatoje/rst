let preprocessor = 'sass',
    fileswatch = 'html,htm,txt,json,md,woff2'

const {src, dest, parallel, series, watch} = require('gulp')
const browserSync = require('browser-sync').create()
const bssi = require('browsersync-ssi')
const ssi = require('ssi')
const webpack = require('webpack-stream')
const sass = require('gulp-sass')(require('sass'))
const sassglob = require('gulp-sass-glob')
const cleancss = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const rsync = require('gulp-rsync')
const del = require('del')
const svgSprite = require('gulp-svg-sprite');

function sprites() {
    return src('app/svg/*.svg')
        .pipe(svgSprite({
                mode: {
                    stack: {
                        sprite: "../app.svg"
                    },
                },
            }
        ))
        .pipe(dest('app/sprite/'));
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/',
            middleware: bssi({baseDir: 'app/', ext: '.html'})
        },
        ghostMode: {clicks: false},
        notify: false,
        online: true,
    })
}

function scripts() {
    return src(['app/js/*.js', '!app/js/*.min.js'])
        .pipe(webpack({
            mode: 'development',
            performance: {hints: false},
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['@babel/env'],
                            plugins: ['babel-plugin-root-import']
                        }
                    }
                ]
            }
        })).on('error', function handleError() {
            this.emit('end')
        })
        .pipe(rename('app.min.js'))
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src([`app/scss/*.*`, `!app/scss/_*.*`])
        .pipe(eval(`${preprocessor}glob`)())
        .pipe(eval(preprocessor)())
        .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions'], grid: true}))
        .pipe(cleancss({level: {1: {specialComments: 0}}}))
        .pipe(rename({suffix: ".min"}))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function buildcopy() {
    return src([
        '{app/js,app/css}/*.min.*',
        'app/images/**/*.*',
        '!app/images/src/**/*',
        'app/fonts/**/*',
        'app/readme.md'
    ], {base: 'app/'})
        .pipe(dest('docs'))
}

async function buildhtml() {
    let includes = new ssi('app/', 'docs/', '/**/*.html')
    includes.compile()
    del('docs/parts', {force: true})
}

function cleandist() {
    return del('docs/**/*', {force: true})
}

function startwatch() {
    watch(`app/scss/**/*`, {usePolling: true}, styles)
    watch(['app/js/**/*.js', '!app/js/**/*.min.js'], {usePolling: true}, scripts)
    watch(`app/**/*.{${fileswatch}}`, {usePolling: true}).on('change', browserSync.reload)
}

exports.scripts = scripts
exports.styles = styles
exports.sprites = sprites
exports.assets = series(scripts, styles)
exports.build = series(cleandist, scripts, styles, buildcopy, buildhtml)
exports.default = series(scripts, styles, parallel(browsersync, startwatch))
