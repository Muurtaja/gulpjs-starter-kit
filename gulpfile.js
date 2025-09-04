const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const through2 = require('through2');
const Vinyl = require('vinyl');
const path = require('path');
const htmlBeautify = require('gulp-html-beautify');
const cssbeautify = require('gulp-cssbeautify');

// Helpers
function titleCase(str) {
    return String(str)
        .replace(/^_/, '')
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, m => m.toUpperCase());
}

function cleanFileName(basename) {
    return basename.replace(/^_/, '');
}

// Paths
const paths = {
    html: {
        pages: 'src/html/pages/*.html',
        layout: 'src/html/layouts/base.html',
        dest: 'dist/',
        watch: 'src/html/**/*.html'
    },
    scss: {
        src: 'src/assets/scss/style.scss',
        dest: 'dist/assets/css/',
        watch: 'src/assets/scss/**/*.scss'
    },
    js: {
        src: 'src/assets/js/**/*.js',
        dest: 'dist/assets/js/'
    }
};

// Clean dist
function clean() {
    return del(['dist']);
}

// Build HTML
function html() {
    return src(paths.html.pages)
        .pipe(
            through2.obj(function (pageFile, _, cb) {
                if (!pageFile.isBuffer()) return cb(null, pageFile);

                const pageRelPath = path.relative(
                    path.join(pageFile.base, '..'),
                    pageFile.path
                );

                const basename = path.basename(pageFile.path);
                const outBase = cleanFileName(basename);
                const title = titleCase(basename);

                const wrapper = new Vinyl({
                    cwd: pageFile.cwd,
                    base: pageFile.base,
                    path: path.join(pageFile.base, outBase),
                    contents: Buffer.from(
                        `@@include('html/layouts/base.html', {\n` +
                        `  "title": "${title}",\n` +
                        `  "section": "${pageRelPath.replace(/\\/g, '/')}"\n` +
                        `})\n`
                    )
                });

                this.push(wrapper);
                cb();
            })
        )
        .pipe(fileInclude({ prefix: '@@', basepath: 'src' }))
        .pipe(htmlBeautify({ indent_size: 2, preserve_newlines: true }))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream());
}

// Compile SCSS -> CSS (beautify at end)
function scss() {
    return src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssbeautify({ indent: '  ', autosemicolon: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.scss.dest))
        .pipe(browserSync.stream());
}

// Copy all assets except scss
function assets() {
    return src(['src/assets/**', '!src/assets/scss{,/**}'])
        .pipe(dest('dist/assets/'))
        .pipe(browserSync.stream());
}

// Serve + watch
function serve() {
    browserSync.init({
        server: { baseDir: 'dist' }
    });

    watch(paths.html.watch, html);
    watch(paths.scss.watch, scss);

    // JS watch → copy + reload
    watch(paths.js.src, series(assets, function reloadJs(cb) {
        browserSync.reload();
        cb();
    }));
}

// Default task
exports.default = series(
    clean,
    parallel(html, scss, assets),
    serve
);
