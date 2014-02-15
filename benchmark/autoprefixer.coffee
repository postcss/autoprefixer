fs   = require('fs')
exec = require('child_process').exec

path = __dirname + '/../build/bin/autoprefixer'
file = __dirname + '/test.css'

module.exports =
  prepare: (css) ->
    fs.writeFileSync(file, css)

  run: (callback) ->
    exec "#{path} #{file} -o #{file}.out", (error, stdout, stderr) ->
      process.stderr.write(stderr)
      process.exit(1) if error

      fs.unlinkSync(file + '.out')

      callback()

  clean: ->
    fs.unlinkSync(file)
