fs   = require('fs-extra')
exec = require('child_process').exec

path = __dirname + '/compass'

module.exports =
  prepare: (css) ->
    css = css.replace(/\stransform: ([^;]+)/g, ' @include transform($1)').
              replace(/\stransition: ([^;]+)/g, ' @include transition($1)').
              replace(/\sbackground(-image)?: ((linear|radial)([^;]+))/g,
                      ' @include background($2)').
              replace(/\sbox-sizing: ([^;]+)/g, '@include box-sizing($1)')
    css = "@import 'compass/css3';\n" + css
    fs.mkdirpSync(path + '/sass')
    fs.mkdirpSync(path + '/stylesheets')
    fs.writeFileSync(path + '/sass/test.scss', css)

  run: (callback) ->
    exec "cd #{path}; bundle exec compass compile", (error, stdout, stderr) ->
      process.stderr.write(stderr)
      process.exit(1) if error

      fs.unlinkSync(path + '/stylesheets/test.css')
      fs.removeSync(path + '/.sass-cache')

      callback()

  clean: ->
    fs.removeSync(path + '/sass')
    fs.removeSync(path + '/stylesheets')
