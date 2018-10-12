let browserslist = require('browserslist')
let postcss = require('postcss')
let agents = require('caniuse-lite').agents

let Browsers = require('./browsers')
let Prefixes = require('./prefixes')
let data = require('../data/prefixes')
let info = require('./info')

function isPlainObject (obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}

let cache = {}

function timeCapsule (result, prefixes) {
  if (prefixes.browsers.selected.length === 0) {
    return
  }
  if (prefixes.add.selectors.length > 0) {
    return
  }
  if (Object.keys(prefixes.add).length > 2) {
    return
  }

  /* istanbul ignore next */
  result.warn(
    'Greetings, time traveller. ' +
    'We are in the golden age of prefix-less CSS, ' +
    'where Autoprefixer is no longer needed for your stylesheet.'
  )
}

module.exports = postcss.plugin('autoprefixer', (...reqs) => {
  let options
  if (reqs.length === 1 && isPlainObject(reqs[0])) {
    options = reqs[0]
    reqs = undefined
  } else if (reqs.length === 0 || (reqs.length === 1 && !reqs[0])) {
    reqs = undefined
  } else if (reqs.length <= 2 && (reqs[0] instanceof Array || !reqs[0])) {
    options = reqs[1]
    reqs = reqs[0]
  } else if (typeof reqs[reqs.length - 1] === 'object') {
    options = reqs.pop()
  }

  if (!options) {
    options = {}
  }

  if (options.browser) {
    throw new Error(
      'Change `browser` option to `browsers` in Autoprefixer'
    )
  } else if (options.browserslist) {
    throw new Error(
      'Change `browserslist` option to `browsers` in Autoprefixer'
    )
  }

  if (options.browsers) {
    reqs = options.browsers
  }

  if (typeof options.grid === 'undefined') {
    options.grid = false
  }

  let brwlstOpts = {
    ignoreUnknownVersions: options.ignoreUnknownVersions,
    stats: options.stats
  }

  function loadPrefixes (opts) {
    let d = module.exports.data
    let browsers = new Browsers(d.browsers, reqs, opts, brwlstOpts)
    let key = browsers.selected.join(', ') + JSON.stringify(options)

    if (!cache[key]) {
      cache[key] = new Prefixes(d.prefixes, browsers, options)
    }

    return cache[key]
  }

  function plugin (css, result) {
    let prefixes = loadPrefixes({
      from: css.source && css.source.input.file,
      env: options.env
    })
    timeCapsule(result, prefixes)
    if (options.remove !== false) {
      prefixes.processor.remove(css, result)
    }
    if (options.add !== false) {
      prefixes.processor.add(css, result)
    }
  }

  plugin.options = options

  plugin.browsers = reqs

  plugin.info = function (opts) {
    opts = opts || {}
    opts.from = opts.from || process.cwd()

    return info(loadPrefixes(opts))
  }

  return plugin
})

/**
 * Autoprefixer data
 */
module.exports.data = { browsers: agents, prefixes: data }

/**
 * Autoprefixer default browsers
 */
module.exports.defaults = browserslist.defaults

/**
 * Inspect with default Autoprefixer
 */
module.exports.info = () => module.exports().info()
