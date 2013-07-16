fs   = require('fs-extra')
exec = require('child_process').exec

module.exports = (css, callback) ->
  path = __dirname + '/compass'
  file = path + '/sass/test.scss'

  css = css.replace(/\stransform: ([^;]+)/g, ' @include transform($1)').
            replace(/\stransition: ([^;]+)/g, ' @include transition($1)').
            replace(/\sbackground(-image)?: ((linear|radial)([^;]+))/g,
                    ' @include background($2)').
            replace(/\sbox-sizing: ([^;]+)/g, '@include box-sizing($1)')
  css = "@import 'compass/css3';\n" + css
  fs.writeFileSync(file, css)

  start = new Date()
  exec "cd #{path}; bundle exec compass compile", (error, stdout, stderr) ->
    now = new Date()

    process.stderr.write(stderr)
    process.exit(1) if error

    fs.unlinkSync(file)
    fs.unlinkSync(path + '/stylesheets/test.css')
    fs.removeSync(path + '/.sass-cache')
    callback(now - start)
