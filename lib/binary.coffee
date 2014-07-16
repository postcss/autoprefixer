autoprefixer = require('./autoprefixer')
path         = require('path')
fs           = require('fs-extra')

class Binary
  constructor: (process) ->
    @arguments = process.argv.slice(2)
    @stdin     = process.stdin
    @stderr    = process.stderr
    @stdout    = process.stdout

    @status     = 0
    @command    = 'compile'
    @inputFiles = []

    @processOptions   = { }
    @processorOptions = { }
    @parseArguments()

  # Quick help message
  help: -> '''
    Usage: autoprefixer [OPTION...] FILES

    Parse CSS files and add prefixed properties and values.

    Options:
      -b, --browsers BROWSERS  add prefixes for selected browsers
      -o, --output FILE        set output file
      -d, --dir DIR            set output dir
      -m, --map                generate source map
          --no-map             skip source map even if previous map exists
      -I, --inline-map         inline map by data:uri to annotation comment
          --annotation PATH    change map location relative from CSS file
          --no-map-annotation  skip source map annotation comment is CSS
          --sources-content    Include origin CSS into map
          --no-cascade         do not create nice visual cascade of prefixes
          --safe               tryt of fix CSS syntax errors
      -i, --info               show selected browsers and properties
      -h, --help               show help text
      -v, --version            print program version
    '''

  # Options description
  desc: -> '''
    Files:
      If you didn't set input files, autoprefixer will \
        read from stdin stream.

      By default, prefixed CSS will rewrite original files.

      You can specify output file or directory by `-o` argument.
      For several input files you can specify only output directory by `-d`.

      Output CSS will be written to stdout stream on \
        `-o -' argument or stdin input.

    Source maps:
      On `-m` argument Autoprefixer will generate source map for changes near
      output CSS (for out/main.css it generates out/main.css.map).

      If previous source map will be near input files (for example, in/main.css
      and in/main.css.map) Autoprefixer will apply previous map to output
      source map.

    Browsers:
      Separate browsers by comma. For example, `-b "> 1%, opera 12"'.
      You can set browsers by global usage statictics: `-b \"> 1%\"'.
      or last version: `-b "last 2 versions"'.
    '''

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
    require('../package.json').version

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

        when '-i', '--info'
          @command = 'info'

        when '-m', '--map'
          @processOptions.map = { }

        when       '--no-map'
          @processOptions.map = false

        when '-I', '--inline-map'
          @processOptions.map ||= { }
          @processOptions.map.inline = true

        when       '--annotation'
          @processOptions.map ||= { }
          @processOptions.map.annotation = args.shift()

        when       '--no-map-annotation'
          @processOptions.map ||= { }
          @processOptions.map.annotation = false

        when       '--sources-content'
          @processOptions.map ||= { }
          @processOptions.map.sourcesContent = true

        when       '--no-cascade'
          @processorOptions.cascade = false

        when       '--safe'
          @processOptions.safe = true

        when '-b', '--browsers'
          @requirements = args.shift().split(',').map (i) -> i.trim()

        when '-o', '--output'
          @outputFile = args.shift()

        when '-d', '--dir'
          @outputDir = args.shift()

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
  info: (done) ->
    @print @compiler().info()
    done()

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
    @compilerCache ||= autoprefixer(@requirements, @processorOptions)

  # Compile loaded CSS
  compileCSS: (css, output, input) ->
    opts = { }
    opts[name] = value for name, value of @processOptions
    opts.from = input  if input
    opts.to   = output if output != '-'

    try
      result = @compiler().process(css, opts)
    catch error
      if error.autoprefixer or error.message.match(/^Can't parse CSS/)
        @error "autoprefixer: #{ error.message }"
      else
        @error 'autoprefixer: Internal error'

      if error.css or not error.autoprefixer
        if error.stack?
          @error ''
          @error error.stack

    return @endWork() unless result?

    if output == '-'
      @print result.css
      @endWork()
    else
      fs.outputFile output, result.css, (error) =>
        @error "autoprefixer: #{ error }" if error

        if result.map
          map = if opts.map?.annotation
            path.resolve(path.dirname(output), opts.map.annotation)
          else
            output + '.map'
          fs.writeFile map, result.map, (error) =>
            @error "autoprefixer: #{ error }" if error
            @endWork()
        else
          @endWork()

  # Return input and output files array
  files: ->
    if @inputFiles.length == 0
      @outputFile ||= '-'

    if @outputDir
      if @inputFiles.length == 0
        @error """autoprefixer: For STDIN input you need to specify output \
                    file (by `-o FILE`),
                  not output dir"""
        return

      if fs.existsSync(@outputDir) and not fs.statSync(@outputDir).isDirectory()
        @error "autoprefixer: Path #{ @outputDir } is a file, not directory"
        return

      for file in @inputFiles
        [file, path.join(@outputDir, path.basename(file))]

    else if @outputFile
      if @inputFiles.length > 1
        @error """autoprefixer: For several files you can specify only output \
                    dir (by `-d DIR`),
                  not one output file"""
        return

      [file, @outputFile] for file in @inputFiles

    else
      [file, file] for file in @inputFiles

  # Compile selected files
  compile: (done) ->
    @waiting      = 0
    @doneCallback = done

    files = @files()
    return done() unless files

    if files.length == 0
      @startWork()

      css = ''
      @stdin.resume()
      @stdin.on 'data', (chunk) -> css += chunk
      @stdin.on 'end', => @compileCSS(css, @outputFile)
    else
      for file in files
        @startWork()

      for [input, output] in files
        unless fs.existsSync(input)
          @workError "autoprefixer: File #{ input } doesn't exists"
          continue

        do (input, output) =>
          fs.readFile input, (error, css) =>
            if error
              @workError "autoprefixer: #{ error.message }"
            else
              @compileCSS(css, output, input)

      false

  # Execute command selected by arguments
  run: (done) ->
    if @command
      @[@command](done)
    else
      done()

module.exports = Binary
