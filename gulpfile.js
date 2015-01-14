var gutil = require('gulp-util');
var gulp  = require('gulp');
var fs    = require('fs-extra');

gulp.task('clean', function (done) {
    fs.remove(__dirname + '/build', done);
});

gulp.task('build:bin', ['clean'], function () {
    var replace = require('gulp-replace');

    return gulp.src('autoprefixer')
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:lib', ['clean'], function () {
    var es6transpiler = require('gulp-es6-transpiler');
    var replace       = require('gulp-replace');

    return gulp.src(['binary.js', 'index.js'])
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(es6transpiler())
        .pipe(gulp.dest('build/'));
});

gulp.task('build:docs', ['clean'], function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().ssddsddplit(/\n+/)
        .concat(['*.js', '.npmignore', 'package.json', 'autoprefixer'])
        .map(function (i) { return '!' + i; });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], function () {
    var editor = require('gulp-json-editor');

    gulp.src('./package.json')
        .pipe(editor(function (json) {
            json.devDependencies['es6-transpiler'] =
                json.dependencies['es6-transpiler'];
            delete json.dependencies['es6-transpiler'];
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

gulp.task('bench', ['build:bin', 'build:lib'], function (done) {
    require('./enable-es6');

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

    var githubStyle = function (callback) {
        styles('https://github.com/', function (styles) {
            gutil.log('Load Github style');
            get(styles[0], function (css) {
                var autoprefixer = require('./build/');
                css = autoprefixer({ browsers: [] }).process(css).css;
                callback(css);
            });
        });
    };

    var indent = function (max, current) {
        var diff = max.toString().length - current.toString().length;
        for ( var i = 0; i < diff; i++ ) {
            process.stdout.write(' ');
        }
    };

    var capitalize = function (text) {
        return text.slice(0, 1).toUpperCase() + text.slice(1);
    };

    var times = { };
    var result = function (code, time) {
        process.stdout.write(time + " ms");
        if ( times.autoprefixer ) {
            var slower = time / times.autoprefixer;
            process.stdout.write(' (' + slower.toFixed(1) + ' times slower)');
        }
        times[code] = time;
        process.stdout.write("\n");
    };

    githubStyle(function (css) {
        var tests = fs.readdirSync(__dirname + '/benchmark')
            .filter(function (file) {
                return file.match(/\.js$/);
            });

        var tick = function () {
            if ( tests.length === 0 ) {
                fs.removeSync(__dirname + '/build/');
                process.stdout.write("\n");
                done();
                return;
            }

            var file = tests.shift();
            var code = file.replace('.js', '');
            var name = capitalize(code);
            process.stdout.write(name + ': ');

            indent('Autoprefixer', name);

            var test = require('./benchmark/' + file);
            test.prepare(css);

            var start = new Date();
            test.run(function () {
                test.run(function () {
                    test.run(function () {
                        test.run(function () {
                            test.run(function () {
                                var end = new Date();
                                result(code, Math.round((end - start) / 5));
                                test.clean();
                                tick();
                            });
                        });
                    });
                });
            });
        };

        process.stdout.write("\n");
        tick();
    });
});

gulp.task('test', function () {
    require('./enable-es6');
    require('should');
    var mocha = require('gulp-mocha');

    return gulp.src('test/*.js', { read: false })
        .pipe(mocha({ timeout: 4000 }));
});

gulp.task('default', ['lint', 'test']);
