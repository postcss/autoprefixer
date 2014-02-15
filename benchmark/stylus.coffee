fs   = require('fs')
exec = require('child_process').exec

path = __dirname + '/../node_modules/.bin/stylus'
file = __dirname + '/test.styl'

module.exports =
  prepare: (css) ->
    css = css.replace('@charset "UTF-8";', "@import 'nib';")
    css = css.replace(/\}/g, "}\n").replace(/(\w)\[[^\]]+\]/g, '$1')
    css = css.replace(/filter:\s*alpha\([^;}]+;?/ig, '')
    fs.writeFileSync(file, css)

  run: (callback) ->
    exec "#{path} --use nib #{file}", (error, stdout, stderr) ->
      process.stderr.write(stderr)
      process.exit(1) if error

      fs.unlinkSync(__dirname + '/test.css')

      callback()

  clean: ->
    fs.unlinkSync(file)
