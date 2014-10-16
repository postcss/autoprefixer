utils = require('./utils')

class Browsers

  # Return all prefixes for default browser data
  @prefixes: ->
    return @prefixesCache if @prefixesCache

    data = require('../data/browsers')
    @prefixesCache = utils.uniq(i.prefix for name, i of data).
                           sort (a, b) -> b.length - a.length

  # Check is value contain any possibe prefix
  @withPrefix: (value) ->
    unless @prefixesRegexp
      @prefixesRegexp = /// #{ @prefixes().join('|') } ///

    @prefixesRegexp.test(value)

  constructor: (@data, requirements) ->
    @selected = @parse(requirements)

  # Return browsers selected by requirements
  parse: (requirements) ->
    requirements = [requirements] unless requirements instanceof Array
    selected = []

    requirements.map (req) =>
      for name, i of @requirements
        if match = req.match(i.regexp)
          selected = selected.concat i.select.apply(@, match[1..-1])
          return
      utils.error "Unknown browser requirement `#{req}`"

    utils.uniq(selected)

  # Aliases for browser names
  aliases:
    fx:             'firefox'
    ff:             'firefox'
    ios:            'ios_saf'
    explorer:       'ie'
    blackberry:     'bb'
    explorermobile: 'ie_mob'
    operamini:      'op_mini'
    operamobile:    'op_mob'
    chromeandroid:  'and_chr'
    firefoxandroid: 'and_ff'

  # Available requirements to select browsers
  requirements:

    none:
      regexp: /^none$/i
      select: ->
        console?.warn("autoprefixer(\'none\') is deprecated and will be " +
                      'removed in 3.1. ' + 'Use autoprefixer({ browsers: [] })')
        []

    lastVersions:
      regexp: /^last (\d+) versions?$/i
      select: (versions) ->
        @browsers (data) ->
          if data.minor then [] else data.versions[0...versions]

    lastByBrowser:
      regexp: /^last (\d+) (\w+) versions?$/i
      select: (versions, browser) ->
        data = @byName(browser)
        data.versions[0...versions].map (v) -> "#{data.name} #{v}"

    globalStatistics:
      regexp: /^> (\d+(\.\d+)?)%$/
      select: (popularity) ->
        @browsers (data) ->
          if data.minor
            []
          else
            data.versions.filter (version, i) -> data.popularity[i] > popularity

    newerThan:
      regexp: /^(\w+) (>=?)\s*([\d\.]+)/
      select: (browser, sign, version) ->
        data    = @byName(browser)
        version = parseFloat(version)

        if sign == '>'
          filter = (v) -> v > version
        else if sign == '>='
          filter = (v) -> v >= version
        data.versions.filter(filter).map (v) -> "#{data.name} #{v}"

    olderThan:
      regexp: /^(\w+) (<=?)\s*([\d\.]+)/
      select: (browser, sign, version) ->
        data    = @byName(browser)
        version = parseFloat(version)

        if sign == '<'
          filter = (v) -> v < version
        else if sign == '<='
          filter = (v) -> v <= version
        data.versions.filter(filter).map (v) -> "#{data.name} #{v}"

    esr:
      regexp: /^(firefox|ff|fx) esr$/i
      select: ->
        ['firefox 31']

    direct:
      regexp: /^(\w+) ([\d\.]+)$/
      select: (browser, version) ->
        data    = @byName(browser)
        version = parseFloat(version)

        last  = if data.future then data.future[0] else data.versions[0]
        first = data.versions[data.versions.length - 1]
        if version > last
          version = last
        else if version < first
          version = first

        ["#{data.name} #{version}"]

  # Select major browsers versions by criteria
  browsers: (criteria) ->
    selected = []
    for browser, data of @data
      versions = criteria(data).map (version) -> "#{browser} #{version}"
      selected = selected.concat(versions)
    selected

  # Return prefix for selected browser
  prefix: (browser) ->
    [name, version] = browser.split(' ')
    if name == 'opera' and parseFloat(version) >= 15
      '-webkit-'
    else
      @data[name].prefix

  # Is browser is selected by requirements
  isSelected: (browser) ->
    @selected.indexOf(browser) != -1

  # Return browser data by it name
  byName: (name) ->
    name = name.toLowerCase()
    name = @aliases[name] || name
    data = @data[name]

    utils.error("Unknown browser #{browser}") unless data
    data.name = name
    data

module.exports = Browsers
