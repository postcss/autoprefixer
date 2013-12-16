fs = require('fs-extra')

sh = (cmd, callback) ->
  require('child_process').exec cmd, (error, stdout, stderr) ->
    process.stderr.write(stderr)
    process.exit(1) if error
    callback()

task 'clean', 'Remove all temporary files', ->
  fs.removeSync(__dirname + '/build')
  fs.removeSync(__dirname + '/autoprefixer.js')

task 'compile', 'Compile CoffeeScript to JS', ->
  invoke('clean')

  coffee = require('coffee-script')

  build = __dirname + '/build'
  fs.removeSync(build)
  fs.mkdirSync(build)

  ignore = fs.readFileSync(__dirname + '/.npmignore').toString().split("\n")
  ignore = ignore.concat(['.git', '.npmignore'])

  compileCoffee = (path) ->
    source = fs.readFileSync(path).toString()
    coffee.compile(source)

  compile = (dir = '/') ->
    path = __dirname + dir + '/'
    for name in fs.readdirSync(__dirname + dir)
      continue if ignore.some (i) -> i == name

      path       = dir + name
      sourcePath = __dirname + path
      buildPath  = build + path

      if fs.statSync(sourcePath).isDirectory()
        fs.mkdirSync(buildPath)
        compile(path + '/')
      else if name[-7..-1] == '.coffee'
        compiled = compileCoffee(sourcePath)
        jsPath   = buildPath.replace(/\.coffee$/, '.js')
        fs.writeFileSync(jsPath, compiled)
      else if path == '/bin/autoprefixer'
        compiled = compileCoffee(sourcePath)
        compiled = "#!/usr/bin/env node\n" + compiled
        fs.writeFileSync(buildPath, compiled)
        fs.chmodSync(buildPath, '775')
      else
        fs.copy(sourcePath, buildPath)

  compile()

task 'publish', 'Publish new version to npm', ->
  invoke('compile', /binary.coffee/)
  build = __dirname + '/build/'
  sh "npm publish #{build}", ->
    fs.removeSync(build)

task 'build', 'Build standalone autoprefixer.js', ->
  invoke('compile')

  browserify = require('browserify')
  builder    = browserify(basedir: __dirname + '/build/')
  builder.add('./lib/autoprefixer.js')

  result = __dirname + '/autoprefixer.js'
  output = fs.createWriteStream(result)
  builder.bundle standalone: 'autoprefixer', (error, build) ->
    fs.removeSync(__dirname + '/build/')

    rails = __dirname + '/../autoprefixer-rails/vendor/autoprefixer.js'
    fs.writeFile(result, build)
    fs.writeFile(rails,  build) if fs.existsSync(rails)

task 'bench', 'Benchmark on GitHub styles', ->
  invoke('compile')

  print = (text) -> process.stdout.write(text)

  https = require('https')
  get = (url, callback) ->
    https.get url, (res) ->
      data = ''
      res.on 'data', (chunk) -> data += chunk
      res.on 'end', -> callback(data)

  capitalize = (text) ->
    text[0].toUpperCase() + text[1..-1]

  loadGithubStyles = (callback) ->
    print("Load GitHub styles")
    get 'https://github.com', (html) ->
      link   = html.match(/[^"]+\.css/g)[0]
      get link, (css) ->
        print("\n")
        autoprefixer = require(__dirname + '/lib/autoprefixer')
        cleaner      = autoprefixer('none')
        callback(cleaner.compile(css))

  indent = (max, current) ->
    diff = max.toString().length - current.toString().length
    for i in [0...diff]
      print(' ')

  loadGithubStyles (css) ->
    times = { }
    tests = fs.readdirSync(__dirname + '/benchmark').filter (file) ->
      file.match(/\.coffee$/)

    tick = ->
      if tests.length == 0
        fs.removeSync(__dirname + '/build/')
        return

      file = tests.shift()
      code = file.replace('.coffee', '')
      name = capitalize code
      print(name + ': ')

      indent('Autoprefixer', name)

      test = require('./benchmark/' + file)
      test css, (time) ->
        print(time + " ms")
        if times.compass
          indent(times.compass, time)
        if times.autoprefixer
          slower = time / times.autoprefixer
          if slower < 1
            print(" (#{ (1 / slower).toFixed(1) } times faster)")
          else
            print(" (#{ slower.toFixed(1) } times slower)")
        times[code] = time
        print("\n")
        tick()

    tick()
