var gutil = require('gulp-util');
var gulp  = require('gulp');
var path  = require('path');
var fs    = require('fs-extra');

gulp.task('clean', ['build:clean', 'bench:clean']);

gulp.task('build:clean', function (done) {
    fs.remove(path.join(__dirname, 'build'), done);
});

gulp.task('build:bin', ['build:clean'], function () {
    var replace = require('gulp-replace');

    return gulp.src('autoprefixer')
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:lib', ['build:clean'], function () {
    var replace = require('gulp-replace');
    var babel   = require('gulp-babel');

    return gulp.src(['binary.js', 'index.js'])
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(babel({ loose: 'all' }))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:docs', ['build:clean'], function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['*.js', '.npmignore', 'package.json', 'autoprefixer'])
        .map(function (i) { return '!' + i; });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['build:clean'], function () {
    var editor = require('gulp-json-editor');

    gulp.src('./package.json')
        .pipe(editor(function (d) {
            d.devDependencies['babel-core'] = d.dependencies['babel-core'];
            delete d.dependencies['babel-core'];
            return d;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:bin', 'build:lib', 'build:docs', 'build:package']);

gulp.task('lint', function () {
    var eslint = require('gulp-eslint');

    return gulp.src(['index.js',
                     'binary.js',
                     'test/*.js',
                     'gulpfile.js',
                     'autoprefixer',
                     'enable-es6.js',
                     'benchmark/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('bench:clean', function (done) {
    fs.remove(path.join(__dirname, 'benchmark/cache/'), done);
});

gulp.task('bench:github', ['build:lib'], function (done) {
    if ( fs.existsSync('./benchmark/cache/github.css') ) return done();

    var zlib, request;
    var get = function (url, callback) {
        if ( !zlib ) {
            zlib    = require('zlib');
            request = require('request');
        }

        request.get({ url: url, headers: { 'accept-encoding': 'gzip' }})
            .on('response', function (res) {
                var chunks = [];
                res.on('data', function (i) {
                    chunks.push(i);
                });
                res.on('end', function () {
                    var buffer = Buffer.concat(chunks);

                    if ( res.headers['content-encoding'] === 'gzip' ) {
                        zlib.gunzip(buffer, function (err, decoded) {
                            if ( err ) throw err;
                            callback(decoded.toString());
                        });

                    } else {
                        callback(buffer.toString());
                    }
                });
            });
    };

    var styles = function (url, callback) {
        get(url, function (html) {
            var files = html.match(/[^"]+\.css("|')/g);
            if ( !files ) throw "Can't find CSS links at " + url;

            callback(files.map(function(file) {
                file = file.slice(0, -1);
                if ( file.match(/^https?:/) ) {
                    return file;
                } else {
                    return file.replace(/^\.?\.?\/?/, url);
                }
            }));
        });
    };

    styles('https://github.com/', function (files) {
        gutil.log('Load Github style');
        get(files[0], function (css) {
            var autoprefixer = require('./build/');
            css = autoprefixer({ browsers: [] }).process(css).css;
            fs.outputFile('./benchmark/cache/github.css', css, done);
        });
    });
});

gulp.task('bench', ['bench:github', 'build:bin'], function () {
    var bench   = require('gulp-bench');
    var summary = require('gulp-bench-summary');
    return gulp.src('./benchmark/general.js', { read: false })
        .pipe(bench())
        .pipe(summary('Autoprefixer'));
});

gulp.task('test', function () {
    require('./enable-es6');
    var mocha = require('gulp-mocha');

    return gulp.src('test/*.js', { read: false })
        .pipe(mocha({ timeout: 4000 }));
});

gulp.task('default', ['lint', 'test']);
