fs   = require('fs-extra')
exec = require('child_process').exec

path = __dirname + '/compass'

bundle = (command, callback) ->
  exec("cd #{path}; bundle exec #{command}", callback)

module.exports =
  prepare: (css) ->
    css = css.replace(/([^-])transform:([^;}]+)(;|})/g,
                      '$1@include transform($2)$3').
              replace(/transition:([^;}]+)(;|})/g,
                      '@include transition($1)$2').
              replace(/background(-image)?:((linear|radial)([^;}]+))(;|})/g,
                      '@include background($2)$5').
              replace(/box-sizing:([^;}]+)(;|})/g,
                      '@include box-sizing($1)$2')
    css = "@import 'compass/css3';\n" + css
    fs.writeFileSync(path + '/test.scss', css)

  run: (callback) ->
    bundle 'sass --compass test.scss:test.css', (error, stdout, stderr) ->
      fs.removeSync(path + '/.sass-cache')

      process.stderr.write(stderr)
      process.exit(1) if error

      callback()

  clean: ->
    fs.unlinkSync(path + '/test.scss')
    fs.unlinkSync(path + '/test.css')
