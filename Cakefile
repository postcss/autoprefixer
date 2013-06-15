fs = require('fs-extra')

sh = (cmd, callback) ->
  require('child_process').exec cmd, (error, stdout, stderr) ->
    process.stderr.write(stderr)
    process.exit(1) if error
    callback()

task 'update', 'Update browsers and properties data', ->
  for i in fs.readdirSync(__dirname + '/updaters')
    require('./updaters/' + i) if i.match(/\.coffee$/)

task 'clean', 'Remove all temporary files', ->
  fs.removeSync(__dirname + '/build')
  fs.removeSync(__dirname + '/autoprefixer.js')

task 'compile', 'Compile CoffeeScript to JS', ->
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
  invoke('compile')
  build = __dirname + '/build/'
  sh "npm publish #{build}", ->
    fs.removeSync(build)

task 'build', 'Build standalone autoprefixer.js', ->
  glob = require('glob')

  invoke('compile')
  build = __dirname + '/build/'

  npm = JSON.parse fs.readFileSync(__dirname + '/package.json').toString()
  config  =
    name:         npm.name
    version:      npm.version
    main:         npm.main + '.js'
    dependencies: { }

  for name, version of npm.dependencies
    config.dependencies["visionmedia/#{name}"] = version.replace(/[^\d\.]/g, '')
  config.scripts = glob.sync(build + '**/*.js').map (i) -> i.replace(build, '')

  fs.writeFileSync(build + 'component.json', JSON.stringify(config))

  component = (command, callback) ->
    sh("cd \"#{build}\"; ../node_modules/.bin/component #{command}", callback)

  component 'install', ->
    component 'build --standalone autoprefixer', ->
      result = __dirname + '/autoprefixer.js'
      fs.copy build + 'build/build.js', result, ->
        fs.removeSync(build)

        rails = __dirname + '/../autoprefixer-rails/vendor/autoprefixer.js'
        fs.copy(result, rails) if fs.existsSync(rails)
