var gulp = require('gulp');
var path = require('path');
var fs   = require('fs-extra');

gulp.task('clean', function (done) {
    fs.remove(path.join(__dirname, 'build'), done);
});

gulp.task('build:bin', ['clean'], function () {
    var replace = require('gulp-replace');

    return gulp.src('autoprefixer')
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:lib', ['clean'], function () {
    var replace = require('gulp-replace');
    var babel   = require('gulp-babel');

    return gulp.src(['binary.js', 'index.js'])
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(babel({ loose: 'all' }))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:docs', ['clean'], function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['*.js', '.npmignore', 'package.json', 'autoprefixer'])
        .map(function (i) { return '!' + i; });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], function () {
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
                     'enable-es6.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', function () {
    require('./enable-es6');
    var mocha = require('gulp-mocha');

    return gulp.src('test/*.js', { read: false })
        .pipe(mocha({ timeout: 6000 }));
});

gulp.task('default', ['lint', 'test']);
