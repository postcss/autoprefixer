fs   = require('fs')
exec = require('child_process').exec

task 'update', 'Update browsers and properties data', ->
  for i in fs.readdirSync(__dirname + '/updaters')
    require('./updaters/' + i) if i.match(/\.coffee$/)

task 'bench', 'Benchmark on GitHub CSS', ->
  autoprefixer = require('./lib/autoprefixer')
  https        = require('https')

  asset = 'assets/github-21d1f919c9b16786238504ad1232b4937bbdd088.css'
  https.get "https://a248.e.akamai.net/assets.github.com/#{asset}", (res) ->
    css = ''
    res.on 'data', (chunk) -> css += chunk
    res.on 'end', ->

      start = new Date()
      autoprefixer.compile(css) for i in [1..100]
      diff = (new Date()) - start
      process.stdout.write(
        "GitHub CSS was autoprefixed 100 times by:\n#{diff} ms\n")

task 'build', 'Build autoprefixer.js to standalone work', ->
  save = ->
    build = __dirname + '/build/build.js'
    js = ";(function () {" +
         fs.readFileSync(build).toString() +

         "require.register('visionmedia-rework/lib/plugins/inline.js', " +
           "function(_, _, module){\n" +
         "module.exports = function () {};\n" +
         "});\n\n" +

         "var autoprefixer = require('autoprefixer/lib/autoprefixer.js');\n" +
         "autoprefixer.inspect = " +
           "require('autoprefixer/lib/autoprefixer/inspect.js');\n" +
         "if (typeof exports == 'object') {\n" +
         "  module.exports = autoprefixer;\n" +
         "} else if (typeof define == 'function' && define.amd) {\n" +
         "  define(function(){ return autoprefixer; });\n" +
         "} else {\n" +
         "  this['autoprefixer'] = autoprefixer;\n" +
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
