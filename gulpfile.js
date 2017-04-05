var gulp = require('gulp');
var path = require('path');
var fs   = require('fs-extra');

gulp.task('clean', function (done) {
    fs.remove(path.join(__dirname, 'autoprefixer.js'), function () {
        fs.remove(path.join(__dirname, 'build'), done);
    });
});

gulp.task('build:lib', ['clean'], function () {
    var babel = require('gulp-babel');

    return gulp.src(['{lib,data}/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('build/'));
});

gulp.task('build:docs', ['clean'], function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json', 'logo.svg'])
        .map(function (i) {
            return '!' + i;
        });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], function () {
    var editor = require('gulp-json-editor');

    return gulp.src('./package.json')
        .pipe(editor(function (json) {
            json.main = 'lib/autoprefixer';
            json.devDependencies['babel-register'] =
                json.dependencies['babel-register'];
            delete json.dependencies['babel-register'];
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

gulp.task('standalone', ['build:lib'], function (done) {
    var builder = require('browserify')({
        basedir:    path.join(__dirname, 'build'),
        standalone: 'autoprefixer'
    });
    builder.add('./lib/autoprefixer.js');

    builder.bundle(function (error, build) {
        if ( error ) throw error;

        fs.removeSync(path.join(__dirname, 'build'));

        var rails = path.join(__dirname, '..', 'autoprefixer-rails',
            'vendor', 'autoprefixer.js');
        if ( fs.existsSync(rails) ) {
            fs.writeFileSync(rails, build);
        } else {
            fs.writeFileSync(path.join(__dirname, 'autoprefixer.js'), build);
        }
        done();
    });
});

gulp.task('lint', function () {
    var eslint = require('gulp-eslint');

    return gulp.src(['index.js', 'gulpfile.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', function () {
    require('babel-register')();
    require('should');

    var mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

gulp.task('default', ['lint', 'test']);
