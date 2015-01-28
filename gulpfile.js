var gutil = require('gulp-util');
var gulp  = require('gulp');
var fs    = require('fs-extra');

gulp.task('clean', ['build:clean', 'bench:clean']);

gulp.task('build:clean', function (done) {
    fs.remove(__dirname + '/build', done);
});

gulp.task('build:bin', ['build:clean'], function () {
    var replace = require('gulp-replace');

    return gulp.src('autoprefixer')
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:lib', ['build:clean'], function () {
    var replace = require('gulp-replace');
    var es6to5  = require('gulp-6to5');

    return gulp.src(['binary.js', 'index.js'])
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(es6to5({ loose: 'all' }))
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
        .pipe(editor(function (json) {
            json.devDependencies['6to5'] = json.dependencies['6to5'];
            delete json.dependencies['6to5'];
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:bin', 'build:lib', 'build:docs', 'build:package']);

gulp.task('lint:test', function () {
    var jshint = require('gulp-jshint');

    return gulp.src('test/*.js')
        .pipe(jshint({ esnext: true, expr: true }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint:lib', function () {
    var jshint = require('gulp-jshint');

    return gulp.src(['index.js',
                     'binary.js',
                     'gulpfile.js',
                     'autoprefixer',
                     'enable-es6.js',
                     'benchmark/*.js'])
        .pipe(jshint({ esnext: true }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint', ['lint:test', 'lint:lib']);

gulp.task('bench:clean', function (done) {
    fs.remove(__dirname + '/benchmark/cache/', done);
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

                    if ( res.headers['content-encoding'] == 'gzip' ) {
                        zlib.gunzip(buffer, function (err, decoded) {
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
            var styles = html.match(/[^"]+\.css("|')/g);
            if ( !styles ) throw "Can't find CSS links at " + url;
            styles = styles.map(function(path) {
                path = path.slice(0, -1);
                if ( path.match(/^https?:/) ) {
                    return path;
                } else {
                    return path.replace(/^\.?\.?\/?/, url);
                }
            });
            callback(styles);
        });
    };

    styles('https://github.com/', function (styles) {
        gutil.log('Load Github style');
        get(styles[0], function (css) {
            var autoprefixer = require('./build/');
            css = autoprefixer({ browsers: [] }).process(css).css;
            fs.outputFile('./benchmark/cache/github.css', css, done);
        });
    });
});

gulp.task('bench', ['bench:github', 'build:bin'], function (done) {
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
