browserslist = require('browserslist')
postcss      = require('postcss')

Browsers = require('./browsers')
Prefixes = require('./prefixes')

infoCache = null
isPlainObject = (obj) ->
  Object.prototype.toString.apply(obj) == '[object Object]'

# Parse CSS and add prefixed properties and values by Can I Use database
# for actual browsers.
#
#   var prefixed = autoprefixer({ browsers: ['> 1%', 'ie 8'] }).process(css);
#
# If you want to combine Autoprefixer with another PostCSS processor:
#
#   postcss.use( autoprefixer({ browsers: ['last 1 version'] }).postcss ).
#           use( compressor ).
#           process(css);
autoprefixer = (reqs...) ->
  if reqs.length == 1 and isPlainObject(reqs[0])
    options = reqs[0]
    reqs    = undefined
  else if reqs.length == 0 or (reqs.length == 1 and not reqs[0]?)
    reqs = undefined
  else if reqs.length <= 2 and (reqs[0] instanceof Array or not reqs[0]?)
    options = reqs[1]
    reqs    = reqs[0]
  else if typeof(reqs[reqs.length - 1]) == 'object'
    options = reqs.pop()

  reqs = options.browsers if options?.browsers?

  new Autoprefixer(autoprefixer.data, reqs, options)

autoprefixer.data =
  browsers: require('../data/browsers')
  prefixes: require('../data/prefixes')

class Autoprefixer
  constructor: (@data, @reqs, @options = { }) ->

  # Parse CSS and add prefixed properties for selected browsers
  process: (str, options = {}) ->
    postcss(@postcss).process(str, options)

  # Return PostCSS processor, which will add necessary prefixes
  postcss: (css) =>
    prefixes = @prefixes(from: css.source.input.file)
    prefixes.processor.remove(css) if @options.remove != false
    prefixes.processor.add(css)

  # Build Prefixes object for current options
  prefixes: (opts) ->
    browsers = new Browsers(autoprefixer.data.browsers, @reqs, opts)
    new Prefixes(autoprefixer.data.prefixes, browsers, @options)

  # Return string, what browsers selected and whar prefixes will be added
  info: (opts) ->
    infoCache ||= require('./info')
    infoCache(@prefixes(opts))

# Autoprefixer default browsers
autoprefixer.defaults = browserslist.defaults

# Lazy load for Autoprefixer with default browsers
autoprefixer.loadDefault = ->
  @defaultCache ||= autoprefixer()

# Compile with default Autoprefixer
autoprefixer.process = (str, options = {}) ->
  @loadDefault().process(str, options)

# PostCSS with default Autoprefixer
autoprefixer.postcss = (css) ->
  autoprefixer.loadDefault().postcss(css)

# Inspect with default Autoprefixer
autoprefixer.info = ->
  @loadDefault().info()

module.exports = autoprefixer
