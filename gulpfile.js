const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');

// Paths
const paths = {
    html: {
        src: 'src/html/pages/**/*.html',
        dest: 'dist/',
        watch: 'src/html/**/*.html'
    },
    scss: {
        src: 'src/scss/style.scss',
        dest: 'dist/css/',
        watch: 'src/scss/**/*.scss'
    },
    css: {
        src: 'src/css/**/*.css',
        dest: 'dist/css/'
    },
    js: {
        src: 'src/js/**/*.js',
        dest: 'dist/js/'
    },
    img: {
        src: 'src/img/**/*',
        dest: 'dist/img/'
    }
};

// Clean dist
function clean() {
    return del(['dist']);
}

// HTML with file include
function html() {
    return src(paths.html.src)
        .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream());
}

// Compile SCSS
function scss() {
    return src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.scss.dest))
        .pipe(browserSync.stream());
}

// Copy raw CSS
function css() {
    return src(paths.css.src)
        .pipe(dest(paths.css.dest))
        .pipe(browserSync.stream());
}

// Copy JS (no concat)
function js() {
    return src(paths.js.src)
        .pipe(dest(paths.js.dest))
        .pipe(browserSync.stream());
}
// Copy images
function images() {
    return src(paths.img.src)
        .pipe(dest(paths.img.dest))
        .pipe(browserSync.stream());
}

// Watch
function serve() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });

    watch(paths.html.watch, html);
    watch(paths.scss.watch, scss);
    watch(paths.css.src, css);
    watch(paths.js.src, js);
    watch(paths.img.src, images);
}

// Default task
exports.default = series(
    clean,
    parallel(html, scss, css, js, images),
    serve
);