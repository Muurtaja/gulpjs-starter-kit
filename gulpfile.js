const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const through2 = require('through2');
const Vinyl = require('vinyl');
const path = require('path');
const fs = require('fs');
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

function getTopFolderUnderPages(pageFile) {
    const relFromPages = path.relative(pageFile.base, pageFile.path);
    const parts = path.dirname(relFromPages).split(path.sep).filter(Boolean);
    return parts.length ? parts[0] : null;
}

// Paths
const paths = {
    html: {
        pages: 'src/html/pages/**/*.html',
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

function html() {
    const masterPath = 'src/html/base/_master.html';
    const masterTemplate = fs.readFileSync(masterPath, 'utf8');

    return src(paths.html.pages)
        .pipe(
            through2.obj(function (pageFile, _, cb) {
                if (!pageFile.isBuffer()) return cb(null, pageFile);

                const basename = path.basename(pageFile.path);
                const startsWithUnderscore = basename.startsWith('_');
                const outBase = cleanFileName(basename);
                const title = titleCase(basename);

                let finalContent;

                if (startsWithUnderscore) {
                    // Files with '_' use the standard layout system with @@include.
                    // This logic is correct and doesn't cause recursion.
                    const pageRelPathFromHtml = path.relative(path.join(pageFile.base, '..'), pageFile.path).replace(/\\/g, '/');
                    const sectionForInclude = `html/${pageRelPathFromHtml}`;
                    const topFolder = getTopFolderUnderPages(pageFile);
                    let chosenLayout = 'html/base/_layout.html';
                    if (topFolder) {
                        const candidateFs = path.join(pageFile.base, '..', 'layouts', `_${topFolder}.html`);
                        if (fs.existsSync(candidateFs)) chosenLayout = `html/base/_${topFolder}.html`;
                    }
                    const contentPath = chosenLayout;

                    finalContent = masterTemplate
                        .replace(
                            "@@include('@@content', {\"title\":\"@@title\",\"section\":\"@@section\"})",
                            `@@include('${contentPath}', {"title":"${title}","section":"${sectionForInclude}"})`
                        )
                        .replace(/@@title/g, title);
                } else {
                    // Files without '_' get their content manually injected into the master template.
                    // This avoids creating a recursive @@include directive.
                    const pageContent = pageFile.contents.toString('utf8');

                    finalContent = masterTemplate
                        // Replace the entire @@include directive for the content block with the actual page content.
                        .replace(/@@include\s*\(\s*'@@content'.*?\)/s, pageContent)
                        .replace(/@@title/g, title);
                }

                const wrapper = new Vinyl({
                    cwd: pageFile.cwd,
                    base: pageFile.base,
                    path: path.join(pageFile.base, outBase),
                    contents: Buffer.from(finalContent)
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

