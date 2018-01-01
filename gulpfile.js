const gulp = require('gulp');
const path = require('path');
const fs   = require('fs-extra');

gulp.task('clean', (done) => {
    fs.remove(path.join(__dirname, 'autoprefixer.js'), () => {
        fs.remove(path.join(__dirname, 'build'), done);
    });
});

gulp.task('build:lib', ['clean'], () => {
    const babel = require('gulp-babel');

    return gulp.src(['{lib,data}/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('build/'));
});

gulp.task('build:docs', ['clean'], () => {
    const ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json', 'logo.svg'])
        .map((i) => '!' + i);

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:bin', ['clean'], () => {
    return gulp.src('bin/*').pipe(gulp.dest('build/bin'));
});

gulp.task('build:package', ['clean'], () => {
    const editor = require('gulp-json-editor');

    return gulp.src('./package.json')
        .pipe(editor((json) => {
            json.main = 'lib/autoprefixer';
            json.devDependencies['babel-register'] =
                json.dependencies['babel-register'];
            delete json.dependencies['babel-register'];
            delete json.babel;
            delete json.scripts;
            delete json.jest;
            delete json.eslintConfig;
            delete json['size-limit'];
            delete json['pre-commit'];
            delete json['lint-staged'];
            delete json.devDependencies;
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:bin', 'build:package']);

gulp.task('standalone', ['build:lib'], (done) => {
    const builder = require('browserify')({
        basedir:    path.join(__dirname, 'build'),
        standalone: 'autoprefixer'
    });
    builder.add('./lib/autoprefixer.js');

    builder
        .transform('babelify', {
            global: true,
            presets: [
                ['env', { node: '0.10', loose: true }]
            ]
        })
        .bundle((error, build) => {
            if (error) throw error;

            fs.removeSync(path.join(__dirname, 'build'));

            const rails = path.join(__dirname, '..', 'autoprefixer-rails',
                'vendor', 'autoprefixer.js');
            if (fs.existsSync(rails)) {
                fs.writeFileSync(rails, build);
            } else {
                const out = path.join(__dirname, 'autoprefixer.js');
                fs.writeFileSync(out, build);
            }
            done();
        });
});

gulp.task('default', ['build']);
