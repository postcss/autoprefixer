# Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>,
# sponsored by Evil Martians.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http:#www.gnu.org/licenses/>.

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
  help: ->
    h = []
    h.push 'Usage: autoprefixer [OPTION...] FILES'
    h.push ''
    h.push 'Parse CSS files and add prefixed properties and values.'
    h.push ''
    h.push 'Options:'
    h.push '  -b, --browsers BROWSERS  add prefixes for selected browsers'
    h.push '  -o, --output FILE        set output CSS file'
    h.push '  -i, --inspect            show selected browsers and properties'
    h.push '  -h, --help               show help text'
    h.push '  -v, --version            print program version'
    h.join("\n")

  # Options description
  desc: ->
    h = []
    h.push 'Files:'
    h.push "  Be default, prefixed CSS will rewrite original files."
    h.push "  If you didn't set input files, " +
           "autoprefixer will read from stdin stream."
    h.push "  Output CSS will be written to stdout stream on " +
           "`-o -' argument or stdin input."
    h.push ''
    h.push 'Browsers:'
    h.push '  Separate browsers by comma. For example, ' +
           "`-b \"> 1%, opera 12\"."
    h.push "  You can set browsers by global usage statictics: " +
           "`-b \"> 1%\"'"
    h.push "  or last version: `-b \"last 2 versions\"' (by default)."
    h.join("\n")

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

      if arg == '-h' or arg == '--help'
        @command = 'showHelp'

      else if arg == '-v' or arg == '--version'
        @command = 'showVersion'

      else if arg == '-i' or arg == '--inspect'
        @command = 'inspect'

      else if arg == '-b' or arg == '--browsers'
        @requirements = args.shift().split(',').map (i) -> i.trim()

      else if arg == '-o' or arg == '--output'
        @outputFile = args.shift()

      else if ( arg.match(/^-\w$/) || arg.match(/^--\w[\w-]+$/) )
        @command = undefined

        @error "autoprefixer: Unknown argument #{ arg }"
        @error ''
        @error @help()

      else
        @inputFiles.push(arg)

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
    @print autoprefixer.inspect(@requirements)
    done()

  # Mark that there is another asyn work
  startWork: ->
    @waiting += 1

  # Execute done callback if there is no works
  endWork: ->
    @waiting -= 1
    @doneCallback() if @waiting <= 0

  # Compile loaded CSS
  compileCSS: (css, file) ->
    try
      prefixed = autoprefixer.compile(css, @requirements)
    catch error
      if error.autoprefixer
        @error "autoprefixer: #{ error.message }"
      else
        @error 'autoprefixer: Internal error'
        @error ''
        @error error.stack
    return @endWork() unless prefixed

    if file == '-'
      @print prefixed
      @endWork()
    else
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
      @stdin.on 'end', => @compileCSS(css, @outputFile)
    else
      fs = require('fs')
      for file in @inputFiles
        @startWork()
        unless fs.existsSync(file)
          @error "autoprefixer: File #{ file } doesn't exists"
          @endWork()
          return

        do (file) =>
          fs.readFile file, (error, css) =>
            if error
              @error "autoprefixer: #{ error }"
            else
              css = css.toString()
              @compileCSS(css, @outputFile || file)

  # Execute command selected by arguments
  run: (done) ->
    if @command
      @[@command](done)
    else
      done()

module.exports = Binary
