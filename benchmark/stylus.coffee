fs   = require('fs')
exec = require('child_process').exec

module.exports = (css, callback) ->
  path = __dirname + '/../node_modules/.bin/stylus'
  file = __dirname + '/test.styl'

  css = css.replace('@charset "UTF-8";', "@import 'nib';")
  css = css.replace(/\}/g, "}\n").replace(/(\w)\[[^\]]+\]/g, '$1')
  fs.writeFileSync(file, css)

  start = new Date()
  exec "#{path} --use nib #{file}", (error, stdout, stderr) ->
    now = new Date()

    process.stderr.write(stderr)
    process.exit(1) if error

    fs.unlinkSync(file)
    fs.unlinkSync(__dirname + '/test.css')
    callback(now - start)
