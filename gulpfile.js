var gulp = require('gulp');
var fs   = require('fs-extra');

gulp.task('clean', function (done) {
    fs.remove(__dirname + '/build', done);
});

gulp.task('build:lib', ['clean'], function () {
    var coffee = require('gulp-coffee');

    return gulp.src(['{lib,data}/**/*.coffee'])
        .pipe(coffee())
        .pipe(gulp.dest('build/'));
});

gulp.task('build:docs', ['clean'], function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json'])
        .map(function (i) { return '!' + i; });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], function () {
    var editor = require('gulp-json-editor');

    gulp.src('./package.json')
        .pipe(editor(function (json) {
            json.main = 'lib/autoprefixer';
            json.devDependencies['coffee-script'] =
                json.dependencies['coffee-script'];
            delete json.dependencies['coffee-script'];
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

gulp.task('test', function () {
    require('coffee-script').register();
    require('should');

    var mocha = require('gulp-mocha');
    return gulp.src('test/*.coffee', { read: false }).pipe(mocha());
});

gulp.task('default', ['test']);
