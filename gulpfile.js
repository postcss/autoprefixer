let gulp = require('gulp')
let fs = require('fs-extra')
let postcss = require('gulp-postcss')
let rename = require('gulp-rename')

function join (...folderPath) { return folderPath.join('/') }

gulp.task('clean', done => {
  fs.remove(join(__dirname, 'autoprefixer.js'), () => {
    fs.remove(join(__dirname, 'build'), done)
  })
})

gulp.task('build:lib', gulp.series('clean', () => {
  let babel = require('gulp-babel')

  return gulp.src(['{lib,data}/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('build/'))
}))

gulp.task('build:docs', () => {
  let ignore = require('fs').readFileSync('.npmignore').toString()
    .trim().split(/\n+/)
    .concat([
      '.npmignore',
      'index.js',
      'package.json',
      'logo.svg',
      'AUTHORS',
      'node_modules'
    ])
    .map(i => '!' + i)

  return gulp.src(['*'].concat(ignore))
    .pipe(gulp.dest('build'))
})

gulp.task('build:bin', () => {
  return gulp.src('bin/*').pipe(gulp.dest('build/bin'))
})

gulp.task('build:package', () => {
  let editor = require('gulp-json-editor')

  return gulp.src('./package.json')
    .pipe(editor(json => {
      json.main = 'lib/autoprefixer'
      delete json.devDependencies
      delete json.babel
      delete json.scripts
      delete json.jest
      delete json.browserslist
      delete json.eslintConfig
      delete json.husky
      delete json['size-limit']
      delete json['lint-staged']
      delete json.dependencies['@babel/register']
      return json
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:lib', 'build:docs', 'build:bin', 'build:package')
))

gulp.task('standalone', gulp.series('clean', 'build:lib', done => {
  let builder = require('browserify')({
    basedir: join(__dirname, 'build'),
    standalone: 'autoprefixer'
  })
  builder.add('./lib/autoprefixer.js')

  builder
    .transform('babelify', {
      global: true,
      presets: [
        [
          '@babel/env', {
            targets: {
              node: 6
            },
            loose: true
          }
        ]
      ]
    })
    .bundle((error, build) => {
      if (error) throw error

      fs.removeSync(join(__dirname, 'build'))

      let rails = join(__dirname, '..', 'autoprefixer-rails',
        'vendor', 'autoprefixer.js')
      if (fs.existsSync(rails)) {
        fs.writeFileSync(rails, build)
      } else {
        let out = join(__dirname, 'autoprefixer.js')
        fs.writeFileSync(out, build)
      }
      done()
    })
}))

gulp.task('compile-playground', () => {
  let autoprefixer = require('./build')
  return gulp.src('./playground/input.css')
    .pipe(rename('output.css'))
    .pipe(postcss([autoprefixer({ grid: 'autoplace' })]))
    .pipe(gulp.dest('./playground'))
})

gulp.task('initialise-playground', gulp.series('build', 'compile-playground'))

gulp.task('watch-playground', () => {
  return gulp.watch('./playground/input.css', gulp.series('compile-playground'))
})

gulp.task('play', gulp.series('initialise-playground', 'watch-playground'))

gulp.task('default', gulp.series('build'))
