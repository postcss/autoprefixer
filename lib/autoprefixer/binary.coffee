autoprefixer = require('../autoprefixer')
fs           = require('fs')

class Binary
  constructor: (process) ->
    @arguments = process.argv.slice(2)
    @stdin     = process.stdin
    @stderr    = process.stderr
    @stdout    = process.stdout

    @status     = 0
    @command    = 'compile'
    @inputFiles = []

    @parseArguments()

  # Quick help message
  help: -> '''
    Usage: autoprefixer [OPTION...] FILES

    Parse CSS files and add prefixed properties and values.

    Options:
      -b, --browsers BROWSERS  add prefixes for selected browsers
      -o, --output FILE        set output CSS file
      -i, --inspect            show selected browsers and properties
      -h, --help               show help text
      -v, --version            print program version
    '''

  # Options description
  desc: -> '''
    Files:
      By default, prefixed CSS will rewrite original files.
      If you didn't set input files, autoprefixer will +
        read from stdin stream.
      Output CSS will be written to stdout stream on +
        `-o -' argument or stdin input.

    Browsers:
      Separate browsers by comma. For example, `-b "> 1%, opera 12"'.
      You can set browsers by global usage statictics: `-b \"> 1%\"'.
      or last version: `-b "last 2 versions"' (by default).
    '''
    .replace(/\+\s+/g, '')

  # Print to stdout
  print: (str) ->
    str = str.replace(/\n$/, '')
    @stdout.write(str + "\n")

  # Print to stdout
  error: (str) ->
    @status = 1
    @stderr.write(str + "\n")

  # Get current version
  version: ->
    require('../../package.json').version

  # Parse arguments
  parseArguments: ->
    args = @arguments.slice()
    while args.length > 0
      arg = args.shift()

      switch arg
        when '-h', '--help'
          @command = 'showHelp'

        when '-v', '--version'
          @command = 'showVersion'

        when '-i', '--inspect'
          @command = 'inspect'

        when '-u', '--update'
          @command = 'update'

        when '-b', '--browsers'
          @requirements = args.shift().split(',').map (i) -> i.trim()

        when '-o', '--output'
          @outputFile = args.shift()

        else
          if arg.match(/^-\w$/) || arg.match(/^--\w[\w-]+$/)
            @command = undefined

            @error "autoprefixer: Unknown argument #{ arg }"
            @error ''
            @error @help()

          else
            @inputFiles.push(arg)

    return

  # Print help
  showHelp: (done) ->
    @print @help()
    @print ''
    @print @desc()
    done()

  # Print version
  showVersion: (done) ->
    @print "autoprefixer #{ @version() }"
    done()

  # Print inspect
  inspect: (done) ->
    @print @compiler().inspect()
    done()

  # Update data
  update: (done) ->
    try
      coffee = require('coffee-script')
    catch
      @error "Install coffee-script npm package"
      return done()

    updater = require('./updater')

    updater.request => @stdout.write('.')
    updater.done =>
      @print ''
      if updater.changed.length == 0
        @print 'Everything up-to-date'
      else
        @print 'Update ' + updater.changed.join(' and ') + ' data'
      done()

    updater.run()

  # Mark that there is another async work
  startWork: ->
    @waiting += 1

  # Execute done callback if there is no works
  endWork: ->
    @waiting -= 1
    @doneCallback() if @waiting <= 0

  # Write error to stderr and finish work
  workError: (str) ->
    @error(str)
    @endWork()

  # Lazy loading for Autoprefixer instance
  compiler: ->
    @compilerCache ||= autoprefixer(@requirements)

  # Compile loaded CSS
  compileCSS: (css, file) ->
    try
      prefixed = @compiler().compile(css)
    catch error
      if error.autoprefixer or error.css
        @error "autoprefixer: #{ error.message }"
      else
        @error 'autoprefixer: Internal error'

      if error.css or not error.autoprefixer
        if error.stack?
          @error ''
          @error error.stack
    return @endWork() unless prefixed

    if @outputFile == '-'
      @print prefixed
      @endWork()

    else if @outputFile
      try
        unless @outputInited
          @outputInited = true
          fs.writeFileSync(@outputFile, '')
        fs.appendFileSync(@outputFile, prefixed)
        @endWork()

      catch error
        @workError "autoprefixer: #{ error.message }"

    else if file
      fs.writeFile file, prefixed, (error) =>
        @error "autoprefixer: #{ error }" if error
        @endWork()

  # Compile selected files
  compile: (done) ->
    @waiting      = 0
    @doneCallback = done

    if @inputFiles.length == 0
      @startWork()
      @outputFile ||= '-'

      css = ''
      @stdin.resume()
      @stdin.on 'data', (chunk) -> css += chunk
      @stdin.on 'end', => @compileCSS(css)
    else
      for file in @inputFiles
        @startWork()

      for file in @inputFiles
        unless fs.existsSync(file)
          @workError "autoprefixer: File #{ file } doesn't exists"
          continue

        try
          css = fs.readFileSync(file).toString()
        catch error
          @workError "autoprefixer: #{ error.message }"
          continue

        @compileCSS(css, file)
      false

  # Execute command selected by arguments
  run: (done) ->
    if @command
      @[@command](done)
    else
      done()

module.exports = Binary
