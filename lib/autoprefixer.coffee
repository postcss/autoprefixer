browserslist = require('browserslist')
postcss      = require('postcss')

Browsers = require('./browsers')
Prefixes = require('./prefixes')

isPlainObject = (obj) ->
  Object.prototype.toString.apply(obj) == '[object Object]'

cache = { }

timeCapsule = (result, prefixes) ->
  return if prefixes.browsers.selected.length == 0
  return if prefixes.add.selectors.length > 0
  return if Object.keys(prefixes.add).length > 2

  result.warn(
    'Greetings, time traveller. ' +
    'We are in the golden age of prefix-less CSS, ' +
    'where Autoprefixer is no longer needed for your stylesheet.')

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

  if options.browser
    throw new Error('Change `browser` option to `browsers` in Autoprefixer')

  reqs = options.browsers if options.browsers?

  loadPrefixes = (opts) ->
    stats    = options.stats
    browsers = new Browsers(module.exports.data.browsers, reqs, opts, stats)
    key      = browsers.selected.join(', ') + JSON.stringify(options)
    cache[key] ||= new Prefixes(module.exports.data.prefixes, browsers, options)

  plugin = (css, result) ->
    prefixes = loadPrefixes(from: css.source?.input.file, env: options.env)
    timeCapsule(result, prefixes)
    prefixes.processor.remove(css)      if options.remove != false
    prefixes.processor.add(css, result) if options.add != false

  plugin.options = options

  plugin.info = (opts) ->
    require('./info')(loadPrefixes(opts))

  plugin

# Autoprefixer data
module.exports.data =
  browsers: require('caniuse-db/data.json').agents
  prefixes: require('../data/prefixes')

# Autoprefixer default browsers
module.exports.defaults = browserslist.defaults

# Inspect with default Autoprefixer
module.exports.info = ->
  module.exports().info()
