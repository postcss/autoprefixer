fs   = require('fs')
exec = require('child_process').exec

task 'update', 'Update browsers and properties data', ->
   require('./updaters/' + i) for i in fs.readdirSync(__dirname + '/updaters')

task 'build', 'Build autoprefixer.js to standalone work', ->
  save = ->
    build = __dirname + '/build/build.js'
    js = ";(function () {" +
         fs.readFileSync(build).toString() +

         "require.register('visionmedia-rework/lib/plugins/inline.js', " +
            "function(_, _, module){\n" +
          "module.exports = function () {};\n" +
          "});\n\n" +

         "var path = 'autoprefixer/lib/autoprefixer.js';\n" +
         "if (typeof exports == 'object') {\n" +
         "  module.exports = require(path);\n" +
         "} else if (typeof define == 'function' && define.amd) {\n" +
         "  define(function(){ return require(path); });\n" +
         "} else {\n" +
         "  this['autoprefixer'] = require(path);\n" +
         "} })();"

    fs.writeFileSync(__dirname + '/autoprefixer.js', js)
    fs.unlinkSync(build)
    fs.rmdirSync(__dirname + '/build/')

  npm_bin = (cmd, callback) ->
    exec "./node_modules/.bin/#{ cmd }", (error, stdout, stderr) ->
      process.stderr.write(stderr)
      process.exit(1) if error
      callback()

  npm_bin 'component install', ->
    npm_bin 'component build', ->
      save()
