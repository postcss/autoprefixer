fs = require('fs-extra')

task 'clean', 'Remove all temporary files', ->
  fs.removeSync(__dirname + '/build')
  fs.removeSync(__dirname + '/autoprefixer.js')

task 'build', 'Compile CoffeeScript to JS', ->
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
      else if path == '/index.js'
        continue
      else if path == '/package.json'
        data = JSON.parse(fs.readFileSync(sourcePath))
        data['main'] = 'lib/autoprefixer'
        delete data['dependencies']['coffee-script']
        fs.writeFileSync(buildPath, JSON.stringify(data, null, 2))
      else
        fs.copy(sourcePath, buildPath)

  compile()
