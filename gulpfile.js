const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const through2 = require('through2');
const Vinyl = require('vinyl');
const path = require('path');

// Helpers
function titleCase(str) {
    return String(str)
        .replace(/^_/, '')              // remove leading underscore
        .replace(/\.[^.]+$/, '')        // drop extension
        .replace(/[-_]+/g, ' ')         // dashes/underscores -> space
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, m => m.toUpperCase());
}

function cleanFileName(basename) {
    return basename.replace(/^_/, ''); // strip leading underscore for output filename
}

// Paths
const paths = {
    html: {
        pages: 'src/html/pages/*.html',       // <-- loop these
        layout: 'src/html/layouts/base.html',
        dest: 'dist/',
        watch: 'src/html/**/*.html'
    },
    scss: {
        src: 'src/assets/scss/style.scss',
        dest: 'dist/assets/css/',
        watch: 'src/assets/scss/**/*.scss'
    },
    css: {
        src: 'src/assets/css/**/*.css',
        dest: 'dist/assets/css/'
    },
    js: {
        src: 'src/assets/js/**/*.js',
        dest: 'dist/assets/js/'
    },
    img: {
        src: 'src/assets/img/**/*',
        dest: 'dist/assets/img/'
    },
    webfonts: {
        src: 'src/assets/webfonts/**/*',
        dest: 'dist/assets/webfonts/'
    }
};

// Clean dist
function clean() {
    return del(['dist']);
}

/**
 * Build pages:
 *  - Read every file in src/html/pages/*.html
 *  - Wrap its path into base.html via @@include parameters
 *  - Run gulp-file-include
 *  - Output one file per page (underscore removed if present)
 */
function html() {
    return src(paths.html.pages)
        .pipe(
            through2.obj(function (pageFile, _, cb) {
                if (!pageFile.isBuffer()) return cb(null, pageFile);

                const pageRelPath = path.relative(
                    path.join(pageFile.base, '..'), // src/html/
                    pageFile.path                   // src/html/pages/<file>
                ); // e.g. 'pages/_index.html' or 'pages/about.html'

                const basename = path.basename(pageFile.path);           // '_index.html'
                const outBase = cleanFileName(basename);                 // 'index.html'
                const title = titleCase(basename);                       // 'Index' or 'About Us'

                // Create a VIRTUAL wrapper file that includes base with params
                // Section = the original page file relative path (e.g. 'pages/_index.html')
                const wrapper = new Vinyl({
                    cwd: pageFile.cwd,
                    base: pageFile.base,
                    path: path.join(pageFile.base, outBase), // output name at this stage
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
        .pipe(fileInclude({ prefix: '@@', basepath: 'src' })) // basepath 'src' so our wrapper include works
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

// Copy JS
function js() {
    return src(paths.js.src)
        .pipe(dest(paths.js.dest))
        .pipe(browserSync.stream());
}

// Copy images
function images() {
    return src(paths.img.src, { encoding: false })
        .pipe(dest(paths.img.dest))
        .pipe(browserSync.stream());
}

// Copy webfonts
function webfonts() {
    return src(paths.webfonts.src)
        .pipe(dest(paths.webfonts.dest))
        .pipe(browserSync.stream());
}

// Serve + watch
function serve() {
    browserSync.init({
        server: { baseDir: 'dist' }
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
    parallel(html, scss, css, js, images, webfonts),
    serve
);
