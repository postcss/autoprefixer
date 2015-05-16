browserslist = require('browserslist')
postcss      = require('postcss')

Browsers = require('./browsers')
Prefixes = require('./prefixes')

isPlainObject = (obj) ->
  Object.prototype.toString.apply(obj) == '[object Object]'

cache = { }

module.exports = postcss.plugin 'autoprefixer', (reqs...) ->
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

  options ||= { }

  reqs = options.browsers if options.browsers?

  loadPrefixes = (opts) ->
    browsers = new Browsers(module.exports.data.browsers, reqs, opts)
    key      = browsers.selected.join(', ')
    cache[key] ||= new Prefixes(module.exports.data.prefixes, browsers, options)

  plugin = (css) ->
    prefixes = loadPrefixes(from: css.source.input.file)
    prefixes.processor.remove(css) if options.remove != false
    prefixes.processor.add(css)    if options.add != false

  plugin.options = options

  plugin.process = (str, options = { }) ->
    console?.warn?('Autoprefixer\'s process() method is deprecated ' +
                   'and will removed in next major release. ' +
                   'Use postcss([autoprefixer]).process() instead')
    postcss(plugin).process(str, options)

  plugin.info = (opts) ->
    require('./info')(loadPrefixes(opts))

  plugin

# Autoprefixer data
module.exports.data =
  browsers: require('caniuse-db/data').agents
  prefixes: require('../data/prefixes')

# Autoprefixer default browsers
module.exports.defaults = browserslist.defaults

# Deprecated shortcut
module.exports.process = (css, options) ->
  module.exports().process(css, options)

# Inspect with default Autoprefixer
module.exports.info = ->
  module.exports().info()
